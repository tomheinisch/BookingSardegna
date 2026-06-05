"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  sendBookingRequestConfirmation,
  sendAdminNewBookingNotification,
  sendBookingConfirmed,
  sendBookingRejected,
  sendBookingCancelled,
} from "@/lib/email";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Nicht eingeloggt");
  return session;
}

async function requireAdmin() {
  const session = await requireAuth();
  if ((session.user as { role?: string })?.role !== "ADMIN") {
    throw new Error("Nicht autorisiert");
  }
  return session;
}

export async function createBooking(formData: FormData) {
  const session = await requireAuth();
  const user = session.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email } })
    : null;
  if (!user) throw new Error("Benutzer nicht gefunden");

  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const propertyId = formData.get("propertyId") as string;
  const guests = parseInt(formData.get("guests") as string) || 1;
  const message = (formData.get("message") as string) || null;

  // Check for conflicts
  const conflict = await prisma.booking.findFirst({
    where: {
      propertyId,
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [{ startDate: { lte: endDate }, endDate: { gte: startDate } }],
    },
  });
  if (conflict) return { error: "Diese Daten sind bereits belegt oder angefragt." };

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new Error("Objekt nicht gefunden");

  await prisma.booking.create({
    data: { propertyId, userId: user.id, startDate, endDate, guests, message },
  });

  // E-Mails (Fehler sollen den Buchungsablauf nicht unterbrechen)
  try {
    await sendBookingRequestConfirmation({
      to: user.email,
      userName: user.name,
      propertyName: property.name,
      startDate,
      endDate,
      guests,
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    await sendAdminNewBookingNotification({
      adminEmails: admins.map((a) => a.email),
      userName: user.name,
      userEmail: user.email,
      propertyName: property.name,
      startDate,
      endDate,
      guests,
      message,
    });
  } catch (e) {
    console.error("E-Mail-Versand fehlgeschlagen:", e);
  }

  revalidatePath("/buchungen");
  revalidatePath(`/objekte/${propertyId}`);
  redirect("/buchungen");
}

export async function cancelBooking(id: string) {
  const session = await requireAuth();
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { user: true, property: true },
  });
  if (!booking) throw new Error("Buchung nicht gefunden");

  const role = (session.user as { role?: string })?.role;
  if (booking.user.email !== session.user?.email && role !== "ADMIN") {
    throw new Error("Nicht autorisiert");
  }

  await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });

  try {
    await sendBookingCancelled({
      to: booking.user.email,
      userName: booking.user.name,
      propertyName: booking.property.name,
      startDate: booking.startDate,
      endDate: booking.endDate,
    });
  } catch (e) {
    console.error("E-Mail-Versand fehlgeschlagen:", e);
  }

  revalidatePath("/buchungen");
  revalidatePath("/admin/buchungen");
}

export async function updateBookingStatus(
  id: string,
  status: "CONFIRMED" | "REJECTED",
  adminNote?: string
) {
  await requireAdmin();
  await prisma.booking.update({
    where: { id },
    data: { status, adminNote: adminNote || null },
  });

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { user: true, property: true },
  });

  if (booking) {
    try {
      if (status === "CONFIRMED") {
        await sendBookingConfirmed({
          to: booking.user.email,
          userName: booking.user.name,
          propertyName: booking.property.name,
          startDate: booking.startDate,
          endDate: booking.endDate,
          guests: booking.guests,
          adminNote: booking.adminNote,
        });
      } else {
        await sendBookingRejected({
          to: booking.user.email,
          userName: booking.user.name,
          propertyName: booking.property.name,
          startDate: booking.startDate,
          endDate: booking.endDate,
          adminNote: booking.adminNote,
        });
      }
    } catch (e) {
      console.error("E-Mail-Versand fehlgeschlagen:", e);
    }
  }

  revalidatePath("/admin/buchungen");
}

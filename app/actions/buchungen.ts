"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  const userId = session.user?.email
    ? (await prisma.user.findUnique({ where: { email: session.user.email } }))!.id
    : null;
  if (!userId) throw new Error("Benutzer nicht gefunden");

  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const propertyId = formData.get("propertyId") as string;

  // Check for conflicts
  const conflict = await prisma.booking.findFirst({
    where: {
      propertyId,
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } },
      ],
    },
  });
  if (conflict) return { error: "Diese Daten sind bereits belegt oder angefragt." };

  await prisma.booking.create({
    data: {
      propertyId,
      userId,
      startDate,
      endDate,
      guests: parseInt(formData.get("guests") as string) || 1,
      message: (formData.get("message") as string) || null,
    },
  });
  revalidatePath("/buchungen");
  revalidatePath(`/objekte/${propertyId}`);
  redirect("/buchungen");
}

export async function cancelBooking(id: string) {
  const session = await requireAuth();
  const booking = await prisma.booking.findUnique({ where: { id }, include: { user: true } });
  if (!booking) throw new Error("Buchung nicht gefunden");

  const role = (session.user as { role?: string })?.role;
  if (booking.user.email !== session.user?.email && role !== "ADMIN") {
    throw new Error("Nicht autorisiert");
  }

  await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/buchungen");
  revalidatePath("/admin/buchungen");
}

export async function updateBookingStatus(id: string, status: "CONFIRMED" | "REJECTED", adminNote?: string) {
  await requireAdmin();
  await prisma.booking.update({
    where: { id },
    data: { status, adminNote: adminNote || null },
  });
  revalidatePath("/admin/buchungen");
}

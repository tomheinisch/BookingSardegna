"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    throw new Error("Nicht autorisiert");
  }
  return session!;
}

export async function createProperty(formData: FormData) {
  await requireAdmin();
  await prisma.property.create({
    data: {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      maxGuests: parseInt(formData.get("maxGuests") as string),
      bedrooms: parseInt(formData.get("bedrooms") as string),
      bathrooms: parseInt(formData.get("bathrooms") as string),
      imageUrl: (formData.get("imageUrl") as string) || null,
    },
  });
  revalidatePath("/admin/objekte");
  revalidatePath("/");
  redirect("/admin/objekte");
}

export async function updateProperty(id: string, formData: FormData) {
  await requireAdmin();
  await prisma.property.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      location: formData.get("location") as string,
      maxGuests: parseInt(formData.get("maxGuests") as string),
      bedrooms: parseInt(formData.get("bedrooms") as string),
      bathrooms: parseInt(formData.get("bathrooms") as string),
      imageUrl: (formData.get("imageUrl") as string) || null,
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/admin/objekte");
  revalidatePath("/");
  redirect("/admin/objekte");
}

export async function deleteProperty(id: string) {
  await requireAdmin();
  await prisma.property.delete({ where: { id } });
  revalidatePath("/admin/objekte");
  revalidatePath("/");
}

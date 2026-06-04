"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    throw new Error("Nicht autorisiert");
  }
}

export async function createUser(formData: FormData) {
  await requireAdmin();
  const password = await bcrypt.hash(formData.get("password") as string, 10);
  await prisma.user.create({
    data: {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password,
      role: formData.get("role") as string,
    },
  });
  revalidatePath("/admin/benutzer");
  redirect("/admin/benutzer");
}

export async function updateUserRole(id: string, role: string) {
  await requireAdmin();
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/benutzer");
}

export async function deleteUser(id: string) {
  await requireAdmin();
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/benutzer");
}

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

export async function changeOwnPassword(
  _prev: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Nicht eingeloggt." };

  const current = formData.get("current") as string;
  const next = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (next.length < 8) return { error: "Das neue Passwort muss mindestens 8 Zeichen lang sein." };
  if (next !== confirm) return { error: "Die Passwörter stimmen nicht überein." };

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "Benutzer nicht gefunden." };

  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return { error: "Das aktuelle Passwort ist falsch." };

  const hashed = await bcrypt.hash(next, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return { success: "Passwort erfolgreich geändert." };
}

export async function resetUserPassword(
  _prev: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const next = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (next.length < 8) return { error: "Das Passwort muss mindestens 8 Zeichen lang sein." };
  if (next !== confirm) return { error: "Die Passwörter stimmen nicht überein." };

  const hashed = await bcrypt.hash(next, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  revalidatePath("/admin/benutzer");
  return { success: "Passwort wurde zurückgesetzt." };
}

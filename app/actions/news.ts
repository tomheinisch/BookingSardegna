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
  return session;
}

export async function createPost(formData: FormData) {
  const session = await requireAdmin();
  const author = await prisma.user.findUnique({ where: { email: session.user!.email! } });
  if (!author) throw new Error("Autor nicht gefunden");

  await prisma.post.create({
    data: {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      published: formData.get("published") === "true",
      authorId: author.id,
    },
  });

  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function updatePost(id: string, formData: FormData) {
  await requireAdmin();

  await prisma.post.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      published: formData.get("published") === "true",
    },
  });

  revalidatePath("/news");
  revalidatePath("/admin/news");
  redirect("/admin/news");
}

export async function deletePost(id: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/news");
  revalidatePath("/admin/news");
}

export async function togglePublished(id: string, published: boolean) {
  await requireAdmin();
  await prisma.post.update({ where: { id }, data: { published } });
  revalidatePath("/news");
  revalidatePath("/admin/news");
}

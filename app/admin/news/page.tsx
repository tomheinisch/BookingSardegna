import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { deletePost, togglePublished } from "@/app/actions/news";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { Pencil, Trash2, Eye, EyeOff, Plus } from "lucide-react";

export default async function AdminNewsPage() {
  const session = await auth();

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Neuigkeiten verwalten</h1>
          <Link
            href="/admin/news/neu"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Neuer Beitrag
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>Noch keine Beiträge. Erstelle deinen ersten!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {posts.map((post) => (
              <div key={post.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`inline-block w-2 h-2 rounded-full ${post.published ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-xs text-gray-400">
                      {post.published ? "Veröffentlicht" : "Entwurf"} · {format(post.createdAt, "dd.MM.yyyy", { locale: de })} · {post.author.name}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                  <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{post.content}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Veröffentlichen / Verbergen */}
                  <form action={async () => {
                    "use server";
                    await togglePublished(post.id, !post.published);
                  }}>
                    <button type="submit" title={post.published ? "Als Entwurf speichern" : "Veröffentlichen"}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </form>

                  {/* Bearbeiten */}
                  <Link href={`/admin/news/${post.id}/bearbeiten`}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Pencil size={16} />
                  </Link>

                  {/* Löschen */}
                  <form action={async () => {
                    "use server";
                    await deletePost(post.id);
                  }}>
                    <button type="submit" title="Löschen"
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

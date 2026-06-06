import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default async function NewsPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin={isAdmin} />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Neuigkeiten</h1>
            <p className="text-gray-500 mt-1">Aktuelles rund um unsere Ferienwohnungen</p>
          </div>
          {isAdmin && (
            <a
              href="/admin/news"
              className="text-sm text-blue-600 hover:underline"
            >
              Beiträge verwalten →
            </a>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📰</div>
            <p>Noch keine Beiträge veröffentlicht.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {posts.map((post) => (
              <article key={post.id} className="border-b border-gray-100 pb-10 last:border-0">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <time dateTime={post.createdAt.toISOString()}>
                    {format(post.createdAt, "dd. MMMM yyyy", { locale: de })}
                  </time>
                  <span>·</span>
                  <span>{post.author.name}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-[15px]">
                  {post.content}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

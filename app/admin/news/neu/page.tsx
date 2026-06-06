import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { createPost } from "@/app/actions/news";
import Link from "next/link";

export default async function NewPostPage() {
  const session = await auth();

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/news" className="text-gray-400 hover:text-gray-600 text-sm">← Zurück</Link>
          <h1 className="text-2xl font-bold text-gray-900">Neuer Beitrag</h1>
        </div>

        <form action={createPost} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
            <input
              name="title"
              required
              placeholder="Was gibt es Neues?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt</label>
            <textarea
              name="content"
              required
              rows={12}
              placeholder="Schreib hier deinen Beitrag..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
            <p className="mt-1 text-xs text-gray-400">Zeilenumbrüche werden übernommen.</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              name="published"
              value="false"
              className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Als Entwurf speichern
            </button>
            <button
              type="submit"
              name="published"
              value="true"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Veröffentlichen
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

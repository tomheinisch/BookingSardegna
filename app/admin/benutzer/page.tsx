import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { createUser, deleteUser, updateUserRole } from "@/app/actions/benutzer";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Trash2 } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await auth();
  const currentUser = await prisma.user.findUnique({ where: { email: session?.user?.email! } });
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Benutzer verwalten</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">E-Mail</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Rolle</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Registriert</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-5 py-3 text-gray-600">{u.email}</td>
                  <td className="px-5 py-3">
                    {u.id === currentUser?.id ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {u.role === "ADMIN" ? "Admin" : "User"} (du)
                      </span>
                    ) : (
                      <form action={async (fd: FormData) => {
                        "use server";
                        await updateUserRole(u.id, fd.get("role") as string);
                      }} className="flex items-center gap-1">
                        <select name="role" defaultValue={u.role}
                          className="text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <button type="submit" className="text-xs text-blue-600 hover:underline ml-1">
                          Speichern
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {format(u.createdAt, "dd.MM.yyyy", { locale: de })}
                  </td>
                  <td className="px-5 py-3">
                    {u.id !== currentUser?.id && (
                      <form action={async () => { "use server"; await deleteUser(u.id); }}>
                        <button type="submit" className="text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Neuen Benutzer anlegen</h2>
          <form action={createUser} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input name="name" required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-Mail</label>
              <input name="email" type="email" required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Passwort</label>
              <input name="password" type="password" required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rolle</label>
              <select name="role"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="col-span-2">
              <button type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Benutzer erstellen
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

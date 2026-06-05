import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import PasswordChangeForm from "./PasswordChangeForm";

export default async function PasswordChangePage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin={isAdmin} />
      <main className="max-w-md mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Passwort ändern</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <PasswordChangeForm />
        </div>
      </main>
    </>
  );
}

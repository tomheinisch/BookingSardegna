import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import PropertyCard from "@/components/PropertyCard";

export default async function HomePage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const properties = await prisma.property.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin={isAdmin} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Unsere Ferienwohnungen
        </h1>
        <p className="text-gray-600 mb-8">Wähle eine Unterkunft und stelle eine Buchungsanfrage.</p>
        {properties.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🏡</div>
            <p>Noch keine Objekte vorhanden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

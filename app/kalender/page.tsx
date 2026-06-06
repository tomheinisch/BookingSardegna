import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import PropertyCalendarView from "./PropertyCalendarView";

export default async function KalenderPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const properties = await prisma.property.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        select: { startDate: true, endDate: true, status: true },
      },
    },
  });

  const data = properties.map((p) => ({
    id: p.id,
    name: p.name,
    location: p.location,
    bookings: p.bookings.map((b) => ({
      from: b.startDate.toISOString(),
      to: b.endDate.toISOString(),
      status: b.status,
    })),
  }));

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin={isAdmin} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Belegungskalender</h1>
        <p className="text-gray-500 mb-6">Übersicht aller freien und gebuchten Zeiträume.</p>

        <div className="flex items-center gap-5 mb-8 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded bg-red-500"></span> Bestätigt
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded bg-amber-400"></span> Angefragt
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded border border-gray-200 bg-white"></span> Frei
          </span>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🏡</div>
            <p>Noch keine Objekte vorhanden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.map((p) => (
              <PropertyCalendarView key={p.id} property={p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

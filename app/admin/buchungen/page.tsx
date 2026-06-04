import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { updateBookingStatus } from "@/app/actions/buchungen";

const statusLabel: Record<string, { text: string; color: string }> = {
  PENDING: { text: "Ausstehend", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { text: "Bestätigt", color: "bg-green-100 text-green-800" },
  REJECTED: { text: "Abgelehnt", color: "bg-red-100 text-red-800" },
  CANCELLED: { text: "Storniert", color: "bg-gray-100 text-gray-600" },
};

export default async function AdminBookingsPage() {
  const session = await auth();
  const bookings = await prisma.booking.findMany({
    include: { property: true, user: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Buchungsanfragen</h1>
        <div className="space-y-4">
          {bookings.length === 0 && (
            <div className="text-center py-20 text-gray-400">Noch keine Buchungsanfragen.</div>
          )}
          {bookings.map((b) => {
            const s = statusLabel[b.status] ?? statusLabel.PENDING;
            return (
              <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{b.property.name}</div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {b.user.name} ({b.user.email}) · {b.guests} Gäste
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      {format(b.startDate, "dd.MM.yyyy", { locale: de })} –{" "}
                      {format(b.endDate, "dd.MM.yyyy", { locale: de })}
                    </div>
                    {b.message && (
                      <p className="text-sm text-gray-600 mt-2 italic">„{b.message}"</p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
                    {s.text}
                  </span>
                </div>
                {b.status === "PENDING" && (
                  <div className="flex gap-2 mt-3">
                    <form action={async (fd: FormData) => {
                      "use server";
                      await updateBookingStatus(b.id, "CONFIRMED", fd.get("note") as string);
                    }}>
                      <input name="note" placeholder="Hinweis (optional)"
                        className="border border-gray-300 rounded px-2 py-1 text-sm mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64" />
                      <button type="submit"
                        className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 transition-colors">
                        Bestätigen
                      </button>
                    </form>
                    <form action={async (fd: FormData) => {
                      "use server";
                      await updateBookingStatus(b.id, "REJECTED", fd.get("note") as string);
                    }}>
                      <input name="note" placeholder="Ablehnungsgrund (optional)"
                        className="border border-gray-300 rounded px-2 py-1 text-sm mr-2 focus:outline-none focus:ring-1 focus:ring-blue-500 w-64" />
                      <button type="submit"
                        className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700 transition-colors">
                        Ablehnen
                      </button>
                    </form>
                  </div>
                )}
                {b.adminNote && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Notiz:</span> {b.adminNote}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

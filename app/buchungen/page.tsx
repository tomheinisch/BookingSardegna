import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cancelBooking } from "@/app/actions/buchungen";

const statusLabel: Record<string, { text: string; color: string }> = {
  PENDING: { text: "Ausstehend", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { text: "Bestätigt", color: "bg-green-100 text-green-800" },
  REJECTED: { text: "Abgelehnt", color: "bg-red-100 text-red-800" },
  CANCELLED: { text: "Storniert", color: "bg-gray-100 text-gray-600" },
};

export default async function MyBookingsPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const dbUser = await prisma.user.findUnique({ where: { email: session?.user?.email! } });
  const bookings = dbUser
    ? await prisma.booking.findMany({
        where: { userId: dbUser.id },
        include: { property: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin={isAdmin} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meine Buchungsanfragen</h1>
        {bookings.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📅</div>
            <p>Du hast noch keine Buchungsanfragen gestellt.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const s = statusLabel[b.status] ?? statusLabel.PENDING;
              return (
                <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{b.property.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {format(b.startDate, "dd.MM.yyyy", { locale: de })} –{" "}
                        {format(b.endDate, "dd.MM.yyyy", { locale: de })} · {b.guests} Gäste
                      </p>
                      {b.message && (
                        <p className="text-sm text-gray-600 mt-2 italic">„{b.message}"</p>
                      )}
                      {b.adminNote && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium">Hinweis Admin:</span> {b.adminNote}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
                      {s.text}
                    </span>
                  </div>
                  {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                    <form
                      action={async () => {
                        "use server";
                        await cancelBooking(b.id);
                      }}
                      className="mt-3"
                    >
                      <button
                        type="submit"
                        className="text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Stornieren
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Building2, CalendarDays, Users, Clock } from "lucide-react";

export default async function AdminDashboard() {
  const session = await auth();

  const [properties, pendingBookings, totalBookings, users] = await Promise.all([
    prisma.property.count({ where: { active: true } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count(),
    prisma.user.count(),
  ]);

  const recentBookings = await prisma.booking.findMany({
    where: { status: "PENDING" },
    include: { property: true, user: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const cards = [
    { label: "Aktive Objekte", value: properties, href: "/admin/objekte", Icon: Building2, color: "bg-blue-500" },
    { label: "Offene Anfragen", value: pendingBookings, href: "/admin/buchungen", Icon: Clock, color: "bg-yellow-500" },
    { label: "Buchungen gesamt", value: totalBookings, href: "/admin/buchungen", Icon: CalendarDays, color: "bg-green-500" },
    { label: "Benutzer", value: users, href: "/admin/benutzer", Icon: Users, color: "bg-purple-500" },
  ];

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin-Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(({ label, value, href, Icon, color }) => (
            <Link key={label} href={href} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className={`inline-flex p-2 rounded-lg ${color} text-white mb-3`}>
                <Icon size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </Link>
          ))}
        </div>
        {recentBookings.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Offene Buchungsanfragen</h2>
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{b.user.name}</span>
                    <span className="text-gray-500"> → {b.property.name}</span>
                  </div>
                  <Link href="/admin/buchungen" className="text-blue-600 hover:underline text-xs">
                    Bearbeiten →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

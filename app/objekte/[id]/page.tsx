import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import BookingCalendar from "@/components/BookingCalendar";
import { notFound } from "next/navigation";
import { MapPin, Users, Bed, Bath } from "lucide-react";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  const property = await prisma.property.findUnique({
    where: { id, active: true },
    include: {
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        select: { startDate: true, endDate: true, status: true },
      },
    },
  });

  if (!property) notFound();

  const bookedRanges = property.bookings.map((b) => ({
    from: b.startDate,
    to: b.endDate,
  }));

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin={isAdmin} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="h-64 rounded-xl overflow-hidden bg-gradient-to-br from-blue-200 to-teal-300 mb-6">
              {property.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-8xl">🏡</div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
            <div className="flex items-center gap-1 text-gray-500 mt-1 mb-4">
              <MapPin size={16} />
              {property.location}
            </div>
            <div className="flex gap-6 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-1"><Users size={16} /> bis zu {property.maxGuests} Gäste</span>
              <span className="flex items-center gap-1"><Bed size={16} /> {property.bedrooms} Schlafzimmer</span>
              <span className="flex items-center gap-1"><Bath size={16} /> {property.bathrooms} Bad</span>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>
          <div>
            <BookingCalendar
              propertyId={property.id}
              bookedRanges={bookedRanges}
              maxGuests={property.maxGuests}
            />
          </div>
        </div>
      </main>
    </>
  );
}

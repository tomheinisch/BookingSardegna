import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Navbar from "@/components/Navbar";
import { updateProperty } from "@/app/actions/objekte";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) notFound();

  const update = updateProperty.bind(null, id);

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/objekte" className="text-gray-400 hover:text-gray-600 text-sm">← Zurück</Link>
          <h1 className="text-2xl font-bold text-gray-900">Objekt bearbeiten</h1>
        </div>
        <form action={update} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input name="name" defaultValue={property.name} required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ort / Lage</label>
            <input name="location" defaultValue={property.location} required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
            <textarea name="description" rows={4} required defaultValue={property.description}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[["Max. Gäste", "maxGuests", property.maxGuests], ["Schlafzimmer", "bedrooms", property.bedrooms], ["Badezimmer", "bathrooms", property.bathrooms]].map(([label, name, val]) => (
              <div key={name as string}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input type="number" name={name as string} defaultValue={val as number} required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bild-URL (optional)</label>
            <input name="imageUrl" defaultValue={property.imageUrl ?? ""}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="active" id="active" defaultChecked={property.active}
              className="rounded border-gray-300" />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">Aktiv (buchbar)</label>
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Änderungen speichern
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

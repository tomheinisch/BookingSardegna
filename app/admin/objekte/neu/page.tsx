import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { createProperty } from "@/app/actions/objekte";
import Link from "next/link";

export default async function NewPropertyPage() {
  const session = await auth();

  return (
    <>
      <Navbar userName={session?.user?.name ?? ""} isAdmin />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/objekte" className="text-gray-400 hover:text-gray-600 text-sm">← Zurück</Link>
          <h1 className="text-2xl font-bold text-gray-900">Neues Objekt</h1>
        </div>
        <form action={createProperty} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <PropertyFormFields />
          <div className="pt-2">
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Objekt erstellen
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

function PropertyFormFields({ defaultValues }: { defaultValues?: Record<string, string | number | boolean | null> }) {
  return (
    <>
      <Field label="Name" name="name" defaultValue={defaultValues?.name as string} required />
      <Field label="Ort / Lage" name="location" defaultValue={defaultValues?.location as string} required />
      <div>
        <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
        <textarea name="description" rows={4} required
          defaultValue={defaultValues?.description as string}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Max. Gäste" name="maxGuests" type="number" defaultValue={defaultValues?.maxGuests as number ?? 6} required />
        <Field label="Schlafzimmer" name="bedrooms" type="number" defaultValue={defaultValues?.bedrooms as number ?? 2} required />
        <Field label="Badezimmer" name="bathrooms" type="number" defaultValue={defaultValues?.bathrooms as number ?? 1} required />
      </div>
      <Field label="Bild-URL (optional)" name="imageUrl" defaultValue={defaultValues?.imageUrl as string} />
    </>
  );
}

function Field({ label, name, type = "text", defaultValue, required }: {
  label: string; name: string; type?: string; defaultValue?: string | number; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input type={type} name={name} defaultValue={defaultValue ?? ""} required={required}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}

export { PropertyFormFields };

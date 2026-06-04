import Link from "next/link";
import { MapPin, Users, Bed, Bath } from "lucide-react";

interface PropertyCardProps {
  id: string;
  name: string;
  description: string;
  location: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl?: string | null;
}

export default function PropertyCard({
  id, name, description, location, maxGuests, bedrooms, bathrooms, imageUrl,
}: PropertyCardProps) {
  return (
    <Link href={`/objekte/${id}`} className="group block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-48 bg-gradient-to-br from-blue-200 to-teal-300 relative overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl">🏡</div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
            <MapPin size={14} />
            {location}
          </div>
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">{description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Users size={14} /> {maxGuests} Gäste</span>
            <span className="flex items-center gap-1"><Bed size={14} /> {bedrooms} Schlafzimmer</span>
            <span className="flex items-center gap-1"><Bath size={14} /> {bathrooms} Bad</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

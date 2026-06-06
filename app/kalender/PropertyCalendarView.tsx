"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { de } from "date-fns/locale";
import { addMonths, startOfDay, eachDayOfInterval } from "date-fns";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/dist/style.css";

interface Booking {
  from: string;
  to: string;
  status: string;
}

interface Props {
  property: {
    id: string;
    name: string;
    location: string;
    bookings: Booking[];
  };
}

export default function PropertyCalendarView({ property }: Props) {
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(today);

  // Alle Tage aus den Buchungsbereichen expandieren
  const confirmedDays: Date[] = [];
  const pendingDays: Date[] = [];

  for (const b of property.bookings) {
    const from = startOfDay(new Date(b.from));
    const to = startOfDay(new Date(b.to));
    const days = eachDayOfInterval({ start: from, end: to });
    if (b.status === "CONFIRMED") confirmedDays.push(...days);
    else pendingDays.push(...days);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-semibold text-gray-900 text-lg">{property.name}</h2>
          <span className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
            <MapPin size={13} /> {property.location}
          </span>
        </div>
        <Link
          href={`/objekte/${property.id}`}
          className="text-xs text-blue-600 hover:underline whitespace-nowrap mt-1"
        >
          Anfrage stellen →
        </Link>
      </div>

      <DayPicker
        mode="single"
        selected={undefined}
        onSelect={() => {}}
        month={month}
        onMonthChange={setMonth}
        locale={de}
        startMonth={today}
        endMonth={addMonths(today, 18)}
        modifiers={{
          confirmed: confirmedDays,
          pending: pendingDays,
        }}
        modifiersClassNames={{
          confirmed: "rdp-confirmed",
          pending: "rdp-pending",
        }}
        classNames={{
          root: "!font-sans",
          month_caption: "text-sm font-semibold text-gray-800",
          day: "text-sm",
        }}
        components={{
          PreviousMonthButton: ({ onClick }) => (
            <button onClick={onClick} className="p-1 rounded hover:bg-gray-100 text-gray-600">
              <ChevronLeft size={16} />
            </button>
          ),
          NextMonthButton: ({ onClick }) => (
            <button onClick={onClick} className="p-1 rounded hover:bg-gray-100 text-gray-600">
              <ChevronRight size={16} />
            </button>
          ),
        }}
      />

      <style>{`
        .rdp-confirmed button, .rdp-confirmed { background-color: #ef4444 !important; color: white !important; border-radius: 4px; }
        .rdp-pending button, .rdp-pending   { background-color: #fbbf24 !important; color: white !important; border-radius: 4px; }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { de } from "date-fns/locale";
import { format, isBefore, startOfDay } from "date-fns";
import { createBooking } from "@/app/actions/buchungen";
import "react-day-picker/dist/style.css";

interface BookedRange {
  from: Date;
  to: Date;
}

interface BookingCalendarProps {
  propertyId: string;
  bookedRanges: BookedRange[];
  maxGuests: number;
}

export default function BookingCalendar({ propertyId, bookedRanges, maxGuests }: BookingCalendarProps) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const today = startOfDay(new Date());

  const isDisabled = (date: Date) => {
    if (isBefore(date, today)) return true;
    return bookedRanges.some(
      (r) => date >= startOfDay(r.from) && date <= startOfDay(r.to)
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!range?.from || !range?.to) {
      setError("Bitte wähle An- und Abreisedatum.");
      return;
    }
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.append("propertyId", propertyId);
    fd.append("startDate", range.from.toISOString());
    fd.append("endDate", range.to.toISOString());
    fd.append("guests", String(guests));
    fd.append("message", message);
    const result = await createBooking(fd);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Buchungsanfrage</h2>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        locale={de}
        disabled={isDisabled}
        modifiersClassNames={{
          selected: "!bg-blue-600 !text-white",
          range_middle: "!bg-blue-100",
          disabled: "!text-gray-300 !cursor-not-allowed",
        }}
        className="mx-auto"
        startMonth={today}
      />
      {range?.from && range?.to && (
        <div className="mt-2 text-sm text-blue-700 text-center">
          {format(range.from, "dd.MM.yyyy", { locale: de })} –{" "}
          {format(range.to, "dd.MM.yyyy", { locale: de })}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Anzahl Gäste</label>
          <input
            type="number"
            min={1}
            max={maxGuests}
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nachricht (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Anmerkungen zur Buchung..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !range?.from || !range?.to}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Wird gesendet…" : "Anfrage senden"}
        </button>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { Home, CalendarDays, Building2, Users, LogOut, Settings } from "lucide-react";

interface NavbarProps {
  userName: string;
  isAdmin: boolean;
}

export default function Navbar({ userName, isAdmin }: NavbarProps) {
  const pathname = usePathname();

  const link = (href: string, label: string, Icon: React.ElementType) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        pathname === href
          ? "bg-blue-700 text-white"
          : "text-blue-100 hover:bg-blue-700/60"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="font-bold text-lg mr-4">🏖 Sardinien</span>
          {link("/", "Übersicht", Home)}
          {link("/buchungen", "Meine Buchungen", CalendarDays)}
          {isAdmin && (
            <>
              {link("/admin", "Dashboard", Settings)}
              {link("/admin/objekte", "Objekte", Building2)}
              {link("/admin/buchungen", "Anfragen", CalendarDays)}
              {link("/admin/benutzer", "Benutzer", Users)}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-blue-200">{userName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-1 text-sm text-blue-200 hover:text-white"
            >
              <LogOut size={16} />
              Abmelden
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}

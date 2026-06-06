"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/actions/auth";
import {
  Home, CalendarDays, Building2, Users, LogOut,
  Settings, KeyRound, CalendarRange, Newspaper, Menu, X,
} from "lucide-react";

interface NavbarProps {
  userName: string;
  isAdmin: boolean;
}

export default function Navbar({ userName, isAdmin }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Übersicht", icon: Home },
    { href: "/buchungen", label: "Meine Buchungen", icon: CalendarDays },
    { href: "/kalender", label: "Belegungsplan", icon: CalendarRange },
    { href: "/news", label: "Neuigkeiten", icon: Newspaper },
    ...(isAdmin ? [
      { href: "/admin", label: "Dashboard", icon: Settings },
      { href: "/admin/objekte", label: "Objekte", icon: Building2 },
      { href: "/admin/buchungen", label: "Anfragen", icon: CalendarDays },
      { href: "/admin/benutzer", label: "Benutzer", icon: Users },
    ] : []),
  ];

  const linkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
      pathname === href
        ? "text-white font-semibold underline underline-offset-4"
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`;

  return (
    <nav className="text-white shadow-md" style={{ backgroundColor: "#8FA3AD" }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="font-bold text-lg shrink-0 mr-4">
            🏖 Sardinien
          </Link>

          {/* Desktop-Links */}
          <div className="hidden md:flex items-center gap-1 flex-1 flex-wrap">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop rechts: Name, Passwort, Abmelden */}
          <div className="hidden md:flex items-center gap-3 shrink-0 ml-2">
            <span className="text-sm text-white/70">{userName}</span>
            <Link href="/profil/passwort" className={linkClass("/profil/passwort")}>
              <KeyRound size={15} />
              Passwort
            </Link>
            <form action={logout}>
              <button type="submit" className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors">
                <LogOut size={15} />
                Abmelden
              </button>
            </form>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menü"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile-Menü */}
      {open && (
        <div
          className="md:hidden border-t border-white/20 px-4 py-3 flex flex-col gap-1"
          style={{ backgroundColor: "#7D9299" }}
        >
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={linkClass(href)}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
          <div className="border-t border-white/20 mt-2 pt-2 flex flex-col gap-1">
            <span className="text-xs text-white/50 px-3 pb-1">{userName}</span>
            <Link href="/profil/passwort" onClick={() => setOpen(false)} className={linkClass("/profil/passwort")}>
              <KeyRound size={15} /> Passwort
            </Link>
            <form action={logout}>
              <button type="submit" className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white w-full">
                <LogOut size={15} /> Abmelden
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
}

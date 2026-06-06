"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { logout } from "@/app/actions/auth";
import {
  Home, CalendarDays, Building2, Users, LogOut,
  Settings, KeyRound, CalendarRange, Newspaper, Menu, X, ChevronDown,
} from "lucide-react";

interface NavbarProps {
  userName: string;
  isAdmin: boolean;
}

export default function Navbar({ userName, isAdmin }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);

  // Admin-Dropdown schließen beim Klick außerhalb
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setAdminOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navItems = [
    { href: "/", label: "Übersicht", icon: Home },
    { href: "/buchungen", label: "Buchungen", icon: CalendarDays },
    { href: "/kalender", label: "Belegungsplan", icon: CalendarRange },
    { href: "/news", label: "Neuigkeiten", icon: Newspaper },
  ];

  const adminItems = [
    { href: "/admin", label: "Dashboard", icon: Settings },
    { href: "/admin/objekte", label: "Objekte", icon: Building2 },
    { href: "/admin/buchungen", label: "Anfragen", icon: CalendarDays },
    { href: "/admin/benutzer", label: "Benutzer", icon: Users },
  ];

  const isAdminActive = adminItems.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));

  const linkClass = (href: string, exact = true) => {
    const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
    return `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
      active
        ? "text-white font-semibold underline underline-offset-4"
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`;
  };

  return (
    <nav className="text-white shadow-md" style={{ backgroundColor: "#8FA3AD" }}>
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center h-13 gap-1">

          {/* Logo */}
          <Link href="/" className="font-bold text-base shrink-0 mr-3">
            🏖 Sardinien
          </Link>

          {/* Desktop-Links */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                <Icon size={15} />
                {label}
              </Link>
            ))}

            {/* Admin-Dropdown */}
            {isAdmin && (
              <div className="relative" ref={adminRef}>
                <button
                  onClick={() => setAdminOpen(!adminOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isAdminActive
                      ? "text-white font-semibold underline underline-offset-4"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Settings size={15} />
                  Admin
                  <ChevronDown size={13} className={`transition-transform ${adminOpen ? "rotate-180" : ""}`} />
                </button>

                {adminOpen && (
                  <div className="absolute top-full left-0 mt-1 w-44 rounded-xl shadow-lg overflow-hidden z-50"
                    style={{ backgroundColor: "#6B8A93" }}>
                    {adminItems.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setAdminOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm text-white/90 hover:bg-white/10 transition-colors ${
                          pathname === href ? "bg-white/15 font-semibold" : ""
                        }`}
                      >
                        <Icon size={14} />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop rechts */}
          <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
            <span className="text-sm text-white/60">{userName}</span>
            <Link href="/profil/passwort" className={linkClass("/profil/passwort")}>
              <KeyRound size={15} />
              Passwort
            </Link>
            <form action={logout}>
              <button type="submit" className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <LogOut size={15} />
                Abmelden
              </button>
            </form>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors ml-auto"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menü"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile-Menü */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/20 px-4 py-3 flex flex-col gap-0.5"
          style={{ backgroundColor: "#7D9299" }}>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={linkClass(href)}>
              <Icon size={15} /> {label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <div className="text-xs text-white/40 px-3 pt-3 pb-1 uppercase tracking-wide">Admin</div>
              {adminItems.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={linkClass(href)}>
                  <Icon size={15} /> {label}
                </Link>
              ))}
            </>
          )}
          <div className="border-t border-white/20 mt-2 pt-2 flex flex-col gap-0.5">
            <span className="text-xs text-white/40 px-3 pb-1">{userName}</span>
            <Link href="/profil/passwort" onClick={() => setMobileOpen(false)} className={linkClass("/profil/passwort")}>
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

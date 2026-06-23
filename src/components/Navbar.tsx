"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Map, Users, MessageCircle, User, LogOut, Bike } from "lucide-react";

const NAV_ITEMS = [
  { href: "/map", label: "Karte", icon: Map },
  { href: "/riders", label: "Fahrer", icon: Users },
  { href: "/messages", label: "Nachrichten", icon: MessageCircle },
] as const;

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-moto-dark/90 backdrop-blur-md border-b border-moto-blue/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <Bike className="w-8 h-8 text-moto-accent group-hover:text-moto-orange transition-colors" />
            <span className="text-xl font-bold text-white tracking-tight">
              Ride<span className="text-moto-accent">App</span>
            </span>
          </Link>

          {session && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-moto-muted hover:text-white hover:bg-moto-surface transition-all"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-moto-muted hover:text-white hover:bg-moto-surface transition-all"
                >
                  <User className="w-4 h-4" />
                  {session.user?.name}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-moto-muted hover:text-moto-accent hover:bg-moto-surface transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                  Anmelden
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Registrieren
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-moto-muted hover:text-white"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-moto-dark border-t border-moto-blue/30 px-4 pb-4">
          {session ? (
            <>
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-3 text-moto-muted hover:text-white transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-3 text-moto-muted hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                Profil
              </Link>
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="flex items-center gap-3 py-3 text-moto-accent hover:text-moto-orange transition-colors w-full"
              >
                <LogOut className="w-5 h-5" />
                Abmelden
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-center">
                Anmelden
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center">
                Registrieren
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

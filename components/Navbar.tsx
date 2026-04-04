"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-black border-b-2 border-red-600 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black uppercase tracking-tight">
            <span className="text-red-500">KLEBEN</span>{" "}
            <span className="text-white">GEGEN</span>{" "}
            <span className="text-yellow-400">RECHTS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/galerie"
            className="uppercase font-bold text-sm tracking-widest hover:text-red-500 transition-colors"
          >
            Galerie
          </Link>
          <Link
            href="/shop"
            className="uppercase font-bold text-sm tracking-widest hover:text-yellow-400 transition-colors"
          >
            Shop
          </Link>
          {session ? (
            <>
              <Link
                href="/admin"
                className="uppercase font-bold text-sm tracking-widest hover:text-green-400 transition-colors"
              >
                Admin
              </Link>
              <button
                onClick={() => signOut()}
                className="uppercase font-bold text-sm tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menü"
        >
          <div className="w-6 h-0.5 bg-white mb-1.5" />
          <div className="w-6 h-0.5 bg-white mb-1.5" />
          <div className="w-6 h-0.5 bg-white" />
        </button>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="md:hidden bg-black border-t border-gray-800 px-4 py-4 flex flex-col gap-4">
          <Link
            href="/galerie"
            onClick={() => setOpen(false)}
            className="uppercase font-bold text-sm tracking-widest hover:text-red-500"
          >
            Galerie
          </Link>
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="uppercase font-bold text-sm tracking-widest hover:text-yellow-400"
          >
            Shop
          </Link>
          {session && (
            <>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="uppercase font-bold text-sm tracking-widest hover:text-green-400"
              >
                Admin
              </Link>
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="text-left uppercase font-bold text-sm tracking-widest text-gray-500"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

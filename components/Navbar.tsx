"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const { cartCount, setCartOpen } = useCart();

  return (
    <nav className="bg-black border-b-2 border-red-600 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-black uppercase tracking-tight">
            <span className="text-red-500">KLEBEN</span>{" "}
            <span className="text-white">GEGEN</span>{" "}
            <span className="text-cyan-500">RECHTS</span>
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
            className="uppercase font-bold text-sm tracking-widest hover:text-cyan-500 transition-colors"
          >
            Shop
          </Link>
          <Link
            href="/blog"
            className="uppercase font-bold text-sm tracking-widest hover:text-red-500 transition-colors"
          >
            Blog
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

        {/* Cart Button — always visible */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2 hover:text-cyan-500 transition-colors"
          aria-label="Warenkorb"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-black w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount}
            </span>
          )}
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-3"
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
        <div className="md:hidden bg-black border-t border-gray-800 px-4 py-6 flex flex-col gap-6">
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
            className="uppercase font-bold text-sm tracking-widest hover:text-cyan-500"
          >
            Shop
          </Link>
          <Link
            href="/blog"
            onClick={() => setOpen(false)}
            className="uppercase font-bold text-sm tracking-widest hover:text-red-500"
          >
            Blog
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

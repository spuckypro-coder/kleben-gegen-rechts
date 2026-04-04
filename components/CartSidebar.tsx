"use client";

import Image from "next/image";
import { useCart } from "./CartProvider";

export default function CartSidebar() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, total } = useCart();

  if (!cartOpen) return null;

  const checkout = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
      }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={() => setCartOpen(false)}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-950 border-l-2 border-red-600 z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="font-black uppercase text-lg">Warenkorb</h2>
          <button onClick={() => setCartOpen(false)} className="font-black hover:text-red-500 text-xl">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center mt-12 uppercase font-bold">Warenkorb ist leer</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 mb-4 border-b border-gray-800 pb-4">
                <div className="w-16 h-16 relative bg-gray-800 shrink-0">
                  <Image src={item.filename} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase text-sm truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs mb-1">{item.artist}</p>
                  {/* Menge */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 border border-gray-700 font-black text-sm hover:border-red-500 hover:text-red-500 flex items-center justify-center"
                    >−</button>
                    <span className="font-black text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                      className="w-6 h-6 border border-gray-700 font-black text-sm hover:border-green-500 hover:text-green-500 flex items-center justify-center"
                    >+</button>
                    <span className="text-cyan-500 font-bold text-sm ml-2">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-600 hover:text-red-500 font-bold shrink-0"
                >✕</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex justify-between font-black uppercase mb-4">
              <span>Gesamt</span>
              <span className="text-cyan-500">{total.toFixed(2)} €</span>
            </div>
            <button
              onClick={checkout}
              className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-500 transition-colors"
            >
              Mit Stripe bezahlen →
            </button>
            <p className="text-gray-600 text-xs text-center mt-3 leading-relaxed">
              Alle Einnahmen dienen ausschließlich der Refinanzierung der Website
              und Neuproduktion von Stickern. Nicht gewinnorientiert.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

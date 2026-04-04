"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  filename: string;
  stock: number;
  artist: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <div className="inline-block mb-3 px-3 py-1 bg-yellow-400 text-black text-xs font-black uppercase tracking-widest">
              Shop
            </div>
            <h1 className="text-5xl font-black uppercase">
              Sticker <span className="text-red-500">Kaufen</span>
            </h1>
          </div>
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative mt-4 px-4 py-3 border-2 border-white font-black uppercase text-sm hover:bg-white hover:text-black transition-colors"
          >
            Warenkorb
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Cart Sidebar */}
        {cartOpen && (
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-950 border-l-2 border-red-600 z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="font-black uppercase text-lg">Warenkorb</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="font-black hover:text-red-500"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center mt-8 uppercase font-bold">
                  Leer
                </p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 mb-4 border-b border-gray-800 pb-4"
                  >
                    <div className="w-16 h-16 relative bg-gray-800 shrink-0">
                      <Image
                        src={item.filename}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-black uppercase text-sm">{item.name}</p>
                      <p className="text-gray-400 text-xs">{item.artist}</p>
                      <p className="text-yellow-400 font-bold">
                        {item.quantity} × {item.price.toFixed(2)} €
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-600 hover:text-red-500 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-800">
                <div className="flex justify-between font-black uppercase mb-4">
                  <span>Gesamt</span>
                  <span className="text-yellow-400">{total.toFixed(2)} €</span>
                </div>
                <button
                  onClick={async () => {
                    const res = await fetch("/api/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        cart: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
                      }),
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="w-full py-3 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-500 transition-colors"
                >
                  Mit Stripe bezahlen →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold uppercase">
            Laden...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-700">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-gray-500 font-bold uppercase text-xl">
              Shop kommt bald!
            </p>
            <p className="text-gray-600 mt-2">
              Produkte können im Admin-Panel hinzugefügt werden.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group sticker-card bg-gray-950 border border-gray-800">
                <div className="relative aspect-square overflow-hidden bg-gray-900">
                  <Image
                    src={product.filename}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <span className="bg-red-600 text-white font-black uppercase px-3 py-1 text-sm">
                        Ausverkauft
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-black uppercase text-sm mb-1">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-1">{product.artist}</p>
                  {product.description && (
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-black">
                      {product.price.toFixed(2)} €
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="px-3 py-1.5 bg-red-600 text-white font-black uppercase text-xs hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Korb
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

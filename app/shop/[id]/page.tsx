"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  filename: string;
  stock: number;
  artist: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (!r.ok) router.push("/shop");
        return r.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => router.push("/shop"));
  }, [id, router]);

  const addToCart = () => {
    if (!product) return;
    const existing = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = existing.findIndex((i: { id: string }) => i.id === product.id);
    if (idx >= 0) {
      existing[idx].quantity += quantity;
    } else {
      existing.push({ ...product, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(existing));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500 font-black uppercase">Laden...</p>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-5xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600 text-xs uppercase font-bold mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-gray-400">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Bild */}
          <div className="relative aspect-square bg-gray-900 border-2 border-gray-800"
            style={{ boxShadow: "6px 6px 0px #ff0033" }}>
            <Image
              src={product.filename}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="bg-red-600 text-white font-black uppercase text-xl px-6 py-3 rotate-[-3deg]">
                  Ausverkauft
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-block mb-3 px-3 py-1 bg-gray-800 text-gray-400 text-xs font-black uppercase tracking-widest">
                {product.artist}
              </div>
              <h1 className="text-4xl font-black uppercase mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="text-4xl font-black text-yellow-400 mb-6">
                {product.price.toFixed(2)} €
              </div>

              {product.description && (
                <div className="border-l-4 border-red-600 pl-4 mb-8">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Lager-Status */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm font-bold uppercase text-gray-400">
                  {product.stock > 5
                    ? "Auf Lager"
                    : product.stock > 0
                    ? `Nur noch ${product.stock} verfügbar`
                    : "Ausverkauft"}
                </span>
              </div>
            </div>

            {/* Kaufen */}
            {product.stock > 0 && (
              <div>
                {/* Menge */}
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-gray-500 text-xs font-black uppercase">Menge</label>
                  <div className="flex items-center border border-gray-700">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 font-black hover:bg-gray-800 transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-black min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 font-black hover:bg-gray-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={addToCart}
                    className={`flex-1 py-4 font-black uppercase tracking-widest transition-colors text-lg ${
                      added
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white hover:bg-red-500"
                    }`}
                    style={{ boxShadow: added ? "none" : "4px 4px 0px #ffcc00" }}
                  >
                    {added ? "✓ Im Warenkorb!" : "In den Warenkorb"}
                  </button>
                </div>

                <Link
                  href="/shop"
                  className="block text-center mt-4 text-gray-600 text-sm font-bold hover:text-white transition-colors"
                >
                  ← Zurück zum Shop
                </Link>
              </div>
            )}

            {product.stock === 0 && (
              <Link
                href="/shop"
                className="block text-center py-4 border border-gray-700 text-gray-500 font-black uppercase hover:border-white hover:text-white transition-colors"
              >
                ← Zurück zum Shop
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

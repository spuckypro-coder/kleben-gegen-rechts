"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import ShopDisclaimer from "@/components/ShopDisclaimer";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  filename: string;
  stock: number;
  artist: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-block mb-3 px-3 py-1 bg-salmon text-black text-xs font-black uppercase tracking-widest">
            Shop
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase">
            Sticker <span className="text-red-500">Kaufen</span>
          </h1>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold uppercase">Laden...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-700">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-gray-500 font-bold uppercase text-xl">Shop kommt bald!</p>
            <p className="text-gray-600 mt-2">Produkte können im Admin-Panel hinzugefügt werden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <div key={product.id} className="group sticker-card bg-gray-950 border border-gray-800">
                <Link href={`/shop/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden bg-gray-900">
                    <Image
                      src={product.filename}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-black uppercase px-3 py-1 text-sm">Ausverkauft</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black font-black uppercase text-xs px-3 py-1">
                        Details ansehen
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/shop/${product.id}`}>
                    <h3 className="font-black uppercase text-sm mb-1 hover:text-red-500 transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-gray-500 text-xs mb-1">{product.artist}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-salmon font-black">{product.price.toFixed(2)} €</span>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="px-3 py-2 bg-red-600 text-white font-black uppercase text-xs hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Korb
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-12">
          <ShopDisclaimer />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import ShopDisclaimer from "@/components/ShopDisclaimer";

interface ProductImage {
  id: string;
  url: string;
  position: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  filename: string;
  stock: number;
  artist: string;
  images: ProductImage[];
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart } = useCart();

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

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
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

  // Build full image list: cover first, then extras
  const allImages = [
    { id: "cover", url: product.filename },
    ...product.images.map((img) => ({ id: img.id, url: img.url })),
  ];

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

        <div className="grid md:grid-cols-2 gap-6 md:gap-12">
          {/* Bilder */}
          <div>
            {/* Hauptbild */}
            <div
              className="relative aspect-square bg-gray-900 border-2 border-gray-800 mb-3"
              style={{ boxShadow: "6px 6px 0px #ff0033" }}
            >
              <Image
                src={allImages[activeImg].url}
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
              {/* Prev/Next arrows wenn mehr als ein Bild */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + allImages.length) % allImages.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 text-white font-black text-xl w-11 h-11 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % allImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 text-white font-black text-xl w-11 h-11 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {allImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 border-2 transition-colors overflow-hidden bg-gray-900 ${
                      activeImg === i ? "border-red-600" : "border-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <Image src={img.url} alt={`Foto ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-block mb-3 px-3 py-1 bg-gray-800 text-gray-400 text-xs font-black uppercase tracking-widest">
                {product.artist}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black uppercase mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="text-3xl sm:text-4xl font-black text-rose-400 mb-6">
                {product.price.toFixed(2)} €
              </div>

              {product.description && (
                <div className="border-l-4 border-red-600 pl-4 mb-8">
                  <div
                    className="blog-content text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
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
                    onClick={handleAddToCart}
                    className={`flex-1 py-4 font-black uppercase tracking-widest transition-colors text-lg ${
                      added
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white hover:bg-red-500"
                    }`}
                    style={{ boxShadow: added ? "none" : "4px 4px 0px #fb8c78" }}
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
        <div className="mt-10">
          <ShopDisclaimer />
        </div>
      </div>
    </div>
  );
}

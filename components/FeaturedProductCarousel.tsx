"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  filename: string;
  price: number;
  artist: string;
}

export default function FeaturedProductCarousel({ products }: { products: Product[] }) {
  const [current, setCurrent] = useState(() =>
    products.length > 1 ? Math.floor(Math.random() * products.length) : 0
  );
  const [prev, setPrev] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      if (next === current) return;
      setPrev(current);
      setCurrent(next);
      setTick((t) => t + 1);
    },
    [current]
  );

  const advance = useCallback(() => {
    goTo((current + 1) % products.length);
  }, [current, goTo, products.length]);

  useEffect(() => {
    if (products.length <= 1) return;
    const id = setInterval(advance, 10000);
    return () => clearInterval(id);
  }, [advance, products.length]);

  if (!products.length) return null;

  const product = products[current];
  const prevProduct = prev !== null ? products[prev] : null;

  const Slide = ({ p }: { p: Product }) => (
    <div className="grid md:grid-cols-2 gap-0 border-2 border-orange-600 h-full" style={{ boxShadow: "8px 8px 0px #dc2626" }}>
      <div className="relative aspect-video md:aspect-square bg-gray-900">
        <Image src={p.filename} alt={p.name} fill className="object-cover" />
        <div className="absolute top-0 left-0 px-4 py-2 bg-orange-600 text-black font-black uppercase text-xs tracking-widest">
          ★ Highlight
        </div>
      </div>
      <div className="bg-gray-950 p-6 md:p-10 flex flex-col justify-between">
        <div>
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">{p.artist}</p>
          <h2 className="text-2xl sm:text-4xl font-black uppercase leading-tight mb-4 text-white">{p.name}</h2>
          {p.description && (
            <div
              className="blog-content text-gray-400 text-sm leading-relaxed mb-6 line-clamp-4"
              dangerouslySetInnerHTML={{ __html: p.description }}
            />
          )}
          <div className="text-3xl sm:text-5xl font-black text-orange-500 mb-6 md:mb-8">
            {p.price.toFixed(2).replace(".", ",")} €
          </div>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/shop/${p.id}`}
            className="flex-1 text-center py-4 bg-orange-600 text-black font-black uppercase tracking-widest hover:bg-orange-500 transition-colors"
            style={{ boxShadow: "4px 4px 0px #dc2626" }}
          >
            Jetzt kaufen →
          </Link>
          <Link
            href="/shop"
            className="px-6 py-4 border-2 border-gray-700 text-gray-400 font-black uppercase text-sm hover:border-white hover:text-white transition-colors"
          >
            Zum Shop
          </Link>
        </div>

        {/* Dots */}
        {products.length > 1 && (
          <div className="flex items-center gap-2 mt-6">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-none font-black ${
                  i === current
                    ? "w-8 h-2 bg-orange-500"
                    : "w-2 h-2 bg-gray-700 hover:bg-gray-500"
                }`}
                aria-label={`Produkt ${i + 1}`}
              />
            ))}
            <span className="ml-auto text-gray-700 text-xs font-bold uppercase tracking-widest">
              {current + 1} / {products.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      {/* Exiting slide */}
      {prevProduct && tick > 0 && (
        <div key={`exit-${tick}`} className="carousel-exit">
          <Slide p={prevProduct} />
        </div>
      )}
      {/* Entering slide */}
      <div
        key={`enter-${tick}`}
        className={tick > 0 ? "carousel-enter relative z-10" : "relative z-10"}
      >
        <Slide p={product} />
      </div>
    </div>
  );
}

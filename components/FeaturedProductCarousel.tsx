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

function ProductSlide({ product }: { product: Product }) {
  return (
    <div className="grid md:grid-cols-2 border-2 border-orange-600" style={{ boxShadow: "8px 8px 0px #dc2626" }}>
      <div className="relative aspect-video md:aspect-square bg-gray-900">
        <Image src={product.filename} alt={product.name} fill className="object-cover" />
        <div className="absolute top-0 left-0 px-4 py-2 bg-orange-600 text-black font-black uppercase text-xs tracking-widest">
          ★ Highlight
        </div>
      </div>
      <div className="bg-gray-950 p-6 md:p-10 flex flex-col justify-between">
        <div>
          <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2">{product.artist}</p>
          <h2 className="text-2xl sm:text-4xl font-black uppercase leading-tight mb-4 text-white">{product.name}</h2>
          {product.description && (
            <div
              className="blog-content text-gray-400 text-sm leading-relaxed mb-6 line-clamp-4"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          <div className="text-3xl sm:text-5xl font-black text-orange-500 mb-6 md:mb-8">
            {product.price.toFixed(2).replace(".", ",")} €
          </div>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/shop/${product.id}`}
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
      </div>
    </div>
  );
}

export default function FeaturedProductCarousel({ products }: { products: Product[] }) {
  const [current, setCurrent] = useState(() =>
    products.length > 1 ? Math.floor(Math.random() * products.length) : 0
  );
  const [prev, setPrev] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((next: number) => {
    setCurrent((cur) => {
      if (next === cur) return cur;
      setPrev(cur);
      setTick((t) => t + 1);
      return next;
    });
  }, []);

  const advance = useCallback(() => {
    setCurrent((cur) => {
      const next = (cur + 1) % products.length;
      setPrev(cur);
      setTick((t) => t + 1);
      return next;
    });
  }, [products.length]);

  useEffect(() => {
    if (products.length <= 1 || paused) return;
    const id = setInterval(advance, 10000);
    return () => clearInterval(id);
  }, [advance, products.length, paused]);

  if (!products.length) return null;

  const prevProduct = prev !== null ? products[prev] : null;

  return (
    <div>
      {/* Slide container */}
      <div className="relative overflow-hidden">
        {/* Exiting slide */}
        {prevProduct && tick > 0 && (
          <div key={`exit-${tick}`} className="carousel-exit pointer-events-none">
            <ProductSlide product={prevProduct} />
          </div>
        )}
        {/* Entering slide */}
        <div key={`enter-${tick}`} className={tick > 0 ? "carousel-enter relative z-10" : "relative z-10"}>
          <ProductSlide product={products[current]} />
        </div>
      </div>

      {/* Controls — outside the animated area */}
      {products.length > 1 && (
        <div className="flex items-center gap-3 mt-4 px-1">
          {/* Prev arrow */}
          <button
            onClick={() => { setPaused(true); goTo((current - 1 + products.length) % products.length); setTimeout(() => setPaused(false), 500); }}
            className="px-3 py-2 border border-gray-700 text-gray-400 font-black text-sm hover:border-orange-500 hover:text-orange-500 transition-colors"
            aria-label="Zurück"
          >
            ←
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2 flex-1">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => { setPaused(true); goTo(i); setTimeout(() => setPaused(false), 500); }}
                className={`transition-all duration-300 ${
                  i === current
                    ? "w-8 h-2 bg-orange-500"
                    : "w-2 h-2 bg-gray-700 hover:bg-gray-500"
                }`}
                aria-label={`Produkt ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">
            {current + 1} / {products.length}
          </span>

          {/* Next arrow */}
          <button
            onClick={() => { setPaused(true); goTo((current + 1) % products.length); setTimeout(() => setPaused(false), 500); }}
            className="px-3 py-2 border border-gray-700 text-gray-400 font-black text-sm hover:border-orange-500 hover:text-orange-500 transition-colors"
            aria-label="Weiter"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

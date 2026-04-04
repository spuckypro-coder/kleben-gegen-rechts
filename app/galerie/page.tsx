"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  filename: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

const CATEGORIES = ["alle", "allgemein", "politik", "street", "series"];

export default function GaleriePage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [category, setCategory] = useState("alle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gallery?category=${category}`)
      .then((r) => r.json())
      .then((data) => {
        setImages(data);
        setLoading(false);
      });
  }, [category]);

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-3 px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest">
            Sticker Kunst
          </div>
          <h1 className="text-5xl font-black uppercase mb-4">
            Die <span className="text-red-500">Galerie</span>
          </h1>
          <p className="text-gray-500 max-w-md mx-auto">
            Alle Werke auf einem Blick. Klick auf ein Bild für Details.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 font-black uppercase text-xs tracking-widest transition-colors ${
                category === cat
                  ? "bg-red-600 text-white"
                  : "border border-gray-700 text-gray-400 hover:border-white hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold uppercase">
            Laden...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-700">
            <p className="text-gray-500 font-bold uppercase">
              Keine Bilder in dieser Kategorie
            </p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {images.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelected(img)}
                className="break-inside-avoid cursor-pointer group relative overflow-hidden bg-gray-900 sticker-card"
              >
                <Image
                  src={img.filename}
                  alt={img.title}
                  width={400}
                  height={400}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {img.featured && (
                  <div className="absolute top-2 left-2 bg-yellow-400 text-black text-xs font-black px-2 py-0.5 uppercase">
                    Featured
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end">
                  <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform w-full">
                    <p className="text-white font-black text-sm uppercase">
                      {img.title}
                    </p>
                    {img.category && (
                      <p className="text-gray-300 text-xs uppercase">
                        {img.category}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-w-3xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-10 right-0 text-white font-black text-xl hover:text-red-500"
            >
              ✕ SCHLIESSEN
            </button>
            <div className="border-2 border-red-600" style={{ boxShadow: "6px 6px 0px #ffcc00" }}>
              <Image
                src={selected.filename}
                alt={selected.title}
                width={800}
                height={800}
                className="w-full object-contain max-h-[70vh]"
              />
              <div className="bg-gray-950 p-4">
                <h2 className="text-xl font-black uppercase text-white">
                  {selected.title}
                </h2>
                {selected.description && (
                  <p className="text-gray-400 mt-1 text-sm">
                    {selected.description}
                  </p>
                )}
                <span className="inline-block mt-2 text-xs font-bold uppercase text-red-500">
                  #{selected.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

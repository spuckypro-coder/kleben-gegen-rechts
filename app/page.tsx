import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const latestImages = await prisma.galleryImage.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-black">
      {/* HERO */}
      <section className="relative overflow-hidden halftone min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
        <div className="relative z-20 max-w-6xl mx-auto px-4 py-24 text-center w-full">
          <div className="inline-block mb-4 px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest">
            Sticker Kunst &amp; Widerstand
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-6">
            <span className="block text-white">KLEBEN</span>
            <span className="block text-red-500">GEGEN</span>
            <span className="block text-yellow-400">RECHTS</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 font-medium">
            Kunst auf der Straße. Sticker als politisches Statement.
            Jedes Kleben ist ein Akt des Widerstands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/galerie"
              className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-500 transition-colors"
              style={{ boxShadow: "4px 4px 0px #ffcc00" }}
            >
              Zur Galerie
            </Link>
            <Link
              href="/shop"
              className="px-8 py-4 border-2 border-white text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
            >
              Sticker Kaufen
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-2 h-full bg-red-600" />
        <div className="absolute top-0 right-0 w-2 h-full bg-yellow-400" />
      </section>

      {/* GALLERY PREVIEW */}
      {latestImages.length > 0 ? (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black uppercase">
              <span className="text-red-500">Aktuelle</span> Werke
            </h2>
            <Link
              href="/galerie"
              className="text-yellow-400 font-bold uppercase text-sm tracking-widest hover:underline"
            >
              Alle ansehen →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {latestImages.map((img, i) => (
              <Link
                key={img.id}
                href="/galerie"
                className={`relative overflow-hidden bg-gray-900 group sticker-card ${
                  i === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
                style={{ aspectRatio: "1" }}
              >
                <Image
                  src={img.filename}
                  alt={img.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end">
                  <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white font-black text-sm uppercase">
                      {img.title}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="border-2 border-dashed border-gray-700 p-20">
            <p className="text-gray-500 text-xl font-bold uppercase">
              Noch keine Werke — lade deine erste Kunst hoch!
            </p>
            <Link
              href="/admin"
              className="inline-block mt-6 px-6 py-3 bg-red-600 text-white font-black uppercase"
            >
              Zum Admin Panel
            </Link>
          </div>
        </section>
      )}

      {/* MARQUEE */}
      <section className="bg-red-600 py-5 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="flex animate-[marquee_20s_linear_infinite]">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="text-white font-black uppercase text-xl mx-8 shrink-0">
                KLEBEN GEGEN RECHTS ✊ KUNST IST WIDERSTAND ✊ STICKER FÜR EINE BESSERE WELT ✊
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP TEASER */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block mb-4 px-3 py-1 bg-yellow-400 text-black text-xs font-black uppercase">
              Shop
            </div>
            <h2 className="text-4xl font-black uppercase mb-4">
              Trag den{" "}
              <span className="text-red-500">Widerstand</span>
              <br />
              in die Stadt
            </h2>
            <p className="text-gray-400 mb-6">
              Hochwertige Sticker direkt aus der Produktion.
              Jeder Kauf unterstützt die Kunst und den Aktivismus.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-yellow-400 text-black font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors"
            >
              Zum Shop →
            </Link>
          </div>
          <div className="border-2 border-gray-800 p-8 text-center bg-gray-950">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-gray-500 font-bold uppercase">
              Sticker · Prints · Merch
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

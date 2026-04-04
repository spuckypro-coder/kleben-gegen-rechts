import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getContent } from "@/lib/content";
import InstagramFeed from "@/components/InstagramFeed";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo_home_title,
    description: c.seo_home_description,
  };
}

export default async function Home() {
  const [latestImages, c] = await Promise.all([
    prisma.galleryImage.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
    getContent(),
  ]);

  return (
    <div className="min-h-screen bg-black">
      {/* HERO */}
      <section className="relative overflow-hidden halftone min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
        <div className="relative z-20 max-w-6xl mx-auto px-4 py-24 text-center w-full">
          <div className="inline-block mb-4 px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest">
            {c.hero_badge}
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-6">
            <span className="block text-white">{c.hero_title_1}</span>
            <span className="block text-red-500">{c.hero_title_2}</span>
            <span className="block text-yellow-400">{c.hero_title_3}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 font-medium">
            {c.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/galerie" className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-500 transition-colors" style={{ boxShadow: "4px 4px 0px #ffcc00" }}>
              {c.hero_btn_galerie}
            </Link>
            <Link href="/shop" className="px-8 py-4 border-2 border-white text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
              {c.hero_btn_shop}
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-2 h-full bg-red-600" />
        <div className="absolute top-0 right-0 w-2 h-full bg-yellow-400" />
      </section>

      {/* ÜBER UNS */}
      {(c.about_text || c.about_title) && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {c.about_badge && (
                <div className="inline-block mb-4 px-3 py-1 bg-yellow-400 text-black text-xs font-black uppercase">
                  {c.about_badge}
                </div>
              )}
              <h2 className="text-4xl font-black uppercase mb-6">
                {c.about_title}
              </h2>
              {c.about_text && <p className="text-gray-400 mb-4 leading-relaxed">{c.about_text}</p>}
              {c.about_text_2 && <p className="text-gray-400 leading-relaxed">{c.about_text_2}</p>}
            </div>
            <div className="border-l-4 border-red-600 pl-8">
              <p className="text-2xl font-black uppercase text-white leading-tight">
                &ldquo;Antifaschismus ist keine Meinung — es ist eine Notwendigkeit.&rdquo;
              </p>
            </div>
          </div>
        </section>
      )}

      {/* GALLERY PREVIEW */}
      {latestImages.length > 0 ? (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black uppercase">
              <span className="text-red-500">Aktuelle</span> Werke
            </h2>
            <Link href="/galerie" className="text-yellow-400 font-bold uppercase text-sm tracking-widest hover:underline">
              Alle ansehen →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {latestImages.map((img, i) => (
              <Link key={img.id} href="/galerie"
                className={`relative overflow-hidden bg-gray-900 group sticker-card ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
                style={{ aspectRatio: "1" }}
              >
                <Image src={img.filename} alt={img.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end">
                  <div className="p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white font-black text-sm uppercase">{img.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="border-2 border-dashed border-gray-700 p-20">
            <p className="text-gray-500 text-xl font-bold uppercase">Noch keine Werke — lade deine erste Kunst hoch!</p>
            <Link href="/admin" className="inline-block mt-6 px-6 py-3 bg-red-600 text-white font-black uppercase">Zum Admin Panel</Link>
          </div>
        </section>
      )}

      {/* MARQUEE */}
      <section className="bg-red-600 py-5 overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 25s linear infinite" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-white font-black uppercase text-xl mx-10 shrink-0">
              {c.marquee_text} <span className="text-yellow-300 mx-4">✊</span>
            </span>
          ))}
        </div>
      </section>

      {/* SHOP TEASER */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block mb-4 px-3 py-1 bg-yellow-400 text-black text-xs font-black uppercase">{c.shop_badge}</div>
            <h2 className="text-4xl font-black uppercase mb-4">
              <span className="text-red-500">{c.shop_title}</span>
            </h2>
            <p className="text-gray-400 mb-6">{c.shop_text}</p>
            <Link href="/shop" className="inline-block px-6 py-3 bg-yellow-400 text-black font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors">
              Zum Shop →
            </Link>
          </div>
          <div className="border-2 border-gray-800 p-8 text-center bg-gray-950">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-gray-500 font-bold uppercase">Sticker · Prints · Merch</p>
          </div>
        </div>
      </section>

      {/* KONTAKT */}
      {(c.contact_instagram || c.contact_email || c.contact_text) && (
        <section className="border-t border-gray-800 py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black uppercase mb-4">
              <span className="text-red-500">Kontakt</span> & Social
            </h2>
            {c.contact_text && <p className="text-gray-400 mb-6 max-w-lg mx-auto">{c.contact_text}</p>}
            <div className="flex gap-4 justify-center flex-wrap">
              {c.contact_instagram && (
                <a href={`https://instagram.com/${c.contact_instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 border-2 border-white font-black uppercase text-sm hover:bg-white hover:text-black transition-colors">
                  Instagram: {c.contact_instagram}
                </a>
              )}
              {c.contact_email && (
                <a href={`mailto:${c.contact_email}`}
                  className="px-6 py-3 border-2 border-gray-700 font-black uppercase text-sm text-gray-400 hover:border-white hover:text-white transition-colors">
                  {c.contact_email}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* INSTAGRAM FEED */}
      <div className="border-t border-gray-900">
        <InstagramFeed />
      </div>

      {/* SEO TEXT */}
      {c.seo_text_home && (
        <section className="border-t border-gray-900 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-gray-600 text-sm leading-relaxed prose prose-invert max-w-none">
              {c.seo_text_home}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

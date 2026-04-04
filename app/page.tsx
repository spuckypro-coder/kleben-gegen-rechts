import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getContent } from "@/lib/content";
import InstagramFeed from "@/components/InstagramFeed";
import ShopDisclaimer from "@/components/ShopDisclaimer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: c.seo_home_title,
    description: c.seo_home_description,
  };
}

export default async function Home() {
  const [latestImages, latestPosts, featuredProduct, c] = await Promise.all([
    prisma.galleryImage.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
    prisma.blogPost.findMany({ where: { published: true }, take: 3, orderBy: { createdAt: "desc" }, select: { title: true, slug: true, excerpt: true, coverImage: true, category: true, createdAt: true } }),
    prisma.product.findFirst({ where: { featured: true, active: true }, include: { images: { orderBy: { position: "asc" }, take: 1 } } }),
    getContent(),
  ]);

  return (
    <div className="min-h-screen">

      {/* ── HERO — Orange ── */}
      <section className="relative overflow-hidden bg-orange-600 flex items-center">
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 text-center w-full">
          <div className="inline-block mb-4 px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-widest">
            {c.hero_badge}
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black uppercase leading-none mb-6">
            <span className="block text-black">{c.hero_title_1}</span>
            <span className="block text-white">{c.hero_title_2}</span>
            <span className="block text-red-700">{c.hero_title_3}</span>
          </h1>
          <p className="text-black/70 text-lg max-w-xl mx-auto mb-10 font-medium">
            {c.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
            <Link
              href="/galerie"
              className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest hover:bg-gray-900 transition-colors"
              style={{ boxShadow: "4px 4px 0px #b91c1c" }}
            >
              {c.hero_btn_galerie}
            </Link>
            <Link
              href="/shop"
              className="px-8 py-4 border-2 border-black text-black font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
              {c.hero_btn_shop}
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-2 h-full bg-black" />
        <div className="absolute top-0 right-0 w-2 h-full bg-red-700" />
      </section>

      {/* ── ÜBER UNS — Anthrazit ── */}
      {(c.about_text || c.about_title) && (
        <section className="bg-zinc-900 w-full">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                {c.about_badge && (
                  <div className="inline-block mb-4 px-3 py-1 bg-orange-600 text-black text-xs font-black uppercase">
                    {c.about_badge}
                  </div>
                )}
                <h2 className="text-4xl font-black uppercase mb-6 text-white">
                  {c.about_title}
                </h2>
                {c.about_text && <p className="text-gray-300 mb-4 leading-relaxed">{c.about_text}</p>}
                {c.about_text_2 && <p className="text-gray-300 leading-relaxed">{c.about_text_2}</p>}
              </div>
              <div className="border-l-4 border-orange-600 pl-8">
                <p className="text-2xl font-black uppercase text-white leading-tight">
                  &ldquo;Antifaschismus ist keine Meinung — es ist eine Notwendigkeit.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── LETZTE BEITRÄGE — Dunkelrot ── */}
      {latestPosts.length > 0 && (
        <section className="bg-red-950 w-full">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black uppercase text-white">
                <span className="text-orange-500">Letzte</span> Beiträge
              </h2>
              <Link href="/blog" className="text-orange-400 font-bold uppercase text-sm tracking-widest hover:underline">
                Alle ansehen →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {latestPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                  <article className="bg-red-900/50 border border-red-800 hover:border-orange-500 transition-colors h-full flex flex-col">
                    {post.coverImage ? (
                      <div className="relative aspect-video overflow-hidden bg-red-900">
                        <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-red-900/70 flex items-center justify-center border-b border-red-800">
                        <span className="text-4xl">✊</span>
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-orange-600 text-black text-xs font-black uppercase">{post.category}</span>
                        <span className="text-red-300/60 text-xs">{new Date(post.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                      <h3 className="font-black uppercase text-sm leading-tight mb-2 text-white group-hover:text-orange-400 transition-colors flex-1">{post.title}</h3>
                      {post.excerpt && <p className="text-red-200/60 text-xs leading-relaxed line-clamp-2">{post.excerpt}</p>}
                      <div className="mt-3 text-orange-400 text-xs font-black uppercase tracking-widest">Weiterlesen →</div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── AKTUELLE WERKE — Schwarz ── */}
      <section className="bg-black w-full">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          {latestImages.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black uppercase text-white">
                  <span className="text-red-500">Aktuelle</span> Werke
                </h2>
                <Link href="/galerie" className="text-orange-500 font-bold uppercase text-sm tracking-widest hover:underline">
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
            </>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-700">
              <p className="text-gray-500 text-xl font-bold uppercase">Noch keine Werke — lade deine erste Kunst hoch!</p>
              <Link href="/admin" className="inline-block mt-6 px-6 py-3 bg-red-600 text-white font-black uppercase">Zum Admin Panel</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── MARQUEE — Rot ── */}
      <section className="bg-red-600 py-5 overflow-hidden">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 25s linear infinite" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="text-white font-black uppercase text-base sm:text-xl mx-6 sm:mx-10 shrink-0">
              {c.marquee_text} <span className="text-black mx-4">✊</span>
            </span>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCT — Dunkelblau ── */}
      {featuredProduct && (
        <section className="bg-slate-900 w-full">
          <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-0 border-2 border-orange-600" style={{ boxShadow: "8px 8px 0px #dc2626" }}>
              <div className="relative aspect-video md:aspect-square bg-slate-800">
                <Image src={featuredProduct.filename} alt={featuredProduct.name} fill className="object-cover" />
                <div className="absolute top-0 left-0 px-4 py-2 bg-orange-600 text-black font-black uppercase text-xs tracking-widest">
                  ★ Highlight
                </div>
              </div>
              <div className="bg-slate-800 p-6 md:p-10 flex flex-col justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">{featuredProduct.artist}</p>
                  <h2 className="text-2xl sm:text-4xl font-black uppercase leading-tight mb-4 text-white">{featuredProduct.name}</h2>
                  {featuredProduct.description && (
                    <div className="blog-content text-slate-300 text-sm leading-relaxed mb-6 line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: featuredProduct.description }} />
                  )}
                  <div className="text-3xl sm:text-5xl font-black text-orange-500 mb-6 md:mb-8">
                    {featuredProduct.price.toFixed(2)} €
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link
                    href={`/shop/${featuredProduct.id}`}
                    className="flex-1 text-center py-4 bg-orange-600 text-black font-black uppercase tracking-widest hover:bg-orange-500 transition-colors"
                    style={{ boxShadow: "4px 4px 0px #dc2626" }}
                  >
                    Jetzt kaufen →
                  </Link>
                  <Link href="/shop" className="px-6 py-4 border-2 border-slate-600 text-slate-300 font-black uppercase text-sm hover:border-white hover:text-white transition-colors">
                    Zum Shop
                  </Link>
                </div>
                <ShopDisclaimer />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SHOP TEASER — Dunkelgrün ── */}
      <section className="bg-emerald-950 w-full">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block mb-4 px-3 py-1 bg-orange-600 text-black text-xs font-black uppercase">{c.shop_badge}</div>
              <h2 className="text-4xl font-black uppercase mb-4 text-white">
                {c.shop_title}
              </h2>
              <p className="text-emerald-200/70 mb-6">{c.shop_text}</p>
              <Link href="/shop" className="inline-block px-6 py-3 bg-orange-600 text-black font-black uppercase tracking-widest hover:bg-orange-500 transition-colors">
                Zum Shop →
              </Link>
            </div>
            <div className="border-2 border-emerald-800 p-8 text-center bg-emerald-900/30">
              <div className="text-6xl mb-4">🏷️</div>
              <p className="text-emerald-300 font-bold uppercase">Sticker · Prints · Merch</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── KONTAKT — Dunkelviolett ── */}
      {(c.contact_instagram || c.contact_email || c.contact_text) && (
        <section className="bg-purple-950 w-full">
          <div className="max-w-6xl mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-black uppercase mb-4 text-white">
              <span className="text-orange-500">Kontakt</span> & Social
            </h2>
            {c.contact_text && <p className="text-purple-200/70 mb-6 max-w-lg mx-auto">{c.contact_text}</p>}
            <div className="flex gap-4 justify-center flex-wrap">
              {c.contact_instagram && (
                <a href={`https://instagram.com/${c.contact_instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 border-2 border-white text-white font-black uppercase text-sm hover:bg-white hover:text-black transition-colors">
                  Instagram: {c.contact_instagram}
                </a>
              )}
              {c.contact_email && (
                <a href={`mailto:${c.contact_email}`}
                  className="px-6 py-3 border-2 border-purple-700 font-black uppercase text-sm text-purple-300 hover:border-white hover:text-white transition-colors">
                  {c.contact_email}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── INSTAGRAM FEED ── */}
      <div className="bg-black border-t border-gray-900">
        <InstagramFeed />
      </div>

      {/* ── SEO TEXT ── */}
      {c.seo_text_home && (
        <section className="bg-black border-t border-gray-900 py-12">
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

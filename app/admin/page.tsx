"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface GalleryImage {
  id: string;
  title: string;
  filename: string;
  category: string;
  featured: boolean;
}

interface Product {
  id: string;
  name: string;
  filename: string;
  price: number;
  stock: number;
  artist: string;
  active: boolean;
}

type Tab = "galerie" | "shop" | "texte";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("galerie");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});
  const [contentSaved, setContentSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery form
  const [imgTitle, setImgTitle] = useState("");
  const [imgDesc, setImgDesc] = useState("");
  const [imgCat, setImgCat] = useState("allgemein");

  // Product form
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodArtist, setProdArtist] = useState("Kleben Gegen Rechts");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      loadImages();
      loadProducts();
      fetch("/api/content").then((r) => r.json()).then(setContent);
    }
  }, [session]);

  const saveContent = async () => {
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setContentSaved(true);
    setTimeout(() => setContentSaved(false), 2000);
  };

  const loadImages = () =>
    fetch("/api/gallery").then((r) => r.json()).then(setImages);

  const loadProducts = () =>
    fetch("/api/products").then((r) => r.json()).then(setProducts);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", tab === "galerie" ? "gallery" : "product");

    if (tab === "galerie") {
      fd.append("title", imgTitle || file.name.replace(/\.[^.]+$/, ""));
      fd.append("description", imgDesc);
      fd.append("category", imgCat);
    } else {
      fd.append("title", prodName || file.name.replace(/\.[^.]+$/, ""));
      fd.append("description", prodDesc);
      fd.append("price", prodPrice || "0");
      fd.append("stock", prodStock || "0");
      fd.append("artist", prodArtist);
    }

    await fetch("/api/upload", { method: "POST", body: fd });

    setUploading(false);
    setImgTitle(""); setImgDesc("");
    setProdName(""); setProdDesc(""); setProdPrice(""); setProdStock("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (tab === "galerie") loadImages();
    else loadProducts();
  };

  const deleteImage = async (id: string) => {
    if (!confirm("Löschen?")) return;
    await fetch(`/api/gallery/${id}`, { method: "DELETE" });
    loadImages();
  };

  const toggleFeatured = async (img: GalleryImage) => {
    await fetch(`/api/gallery/${img.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !img.featured }),
    });
    loadImages();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500 font-bold uppercase">Laden...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-black py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10">
          <div className="inline-block mb-2 px-3 py-1 bg-green-600 text-white text-xs font-black uppercase">
            Admin Panel
          </div>
          <h1 className="text-4xl font-black uppercase">
            Willkommen, <span className="text-red-500">{session.user?.name}</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          {(["galerie", "shop", "texte"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 font-black uppercase text-sm tracking-widest transition-colors border-b-2 -mb-0.5 ${
                tab === t
                  ? "border-red-600 text-white"
                  : "border-transparent text-gray-500 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="md:col-span-1">
            <div className="bg-gray-950 border border-gray-800 p-6">
              <h2 className="font-black uppercase mb-4 text-sm tracking-widest text-gray-400">
                {tab === "galerie" ? "Bild hochladen" : "Produkt hinzufügen"}
              </h2>

              {/* Drop Zone */}
              <div
                className={`drop-zone p-8 text-center mb-4 cursor-pointer ${dragOver ? "drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleUpload(file);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-4xl mb-2">📁</div>
                <p className="text-gray-500 text-sm font-bold uppercase">
                  Datei hier ablegen
                </p>
                <p className="text-gray-600 text-xs mt-1">oder klicken</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                  }}
                />
              </div>

              {tab === "galerie" ? (
                <>
                  <input
                    type="text"
                    placeholder="Titel"
                    value={imgTitle}
                    onChange={(e) => setImgTitle(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 mb-3 text-sm focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="text"
                    placeholder="Beschreibung (optional)"
                    value={imgDesc}
                    onChange={(e) => setImgDesc(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 mb-3 text-sm focus:outline-none focus:border-red-600"
                  />
                  <select
                    value={imgCat}
                    onChange={(e) => setImgCat(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 mb-3 text-sm focus:outline-none focus:border-red-600"
                  >
                    <option value="allgemein">Allgemein</option>
                    <option value="politik">Politik</option>
                    <option value="street">Street</option>
                    <option value="series">Series</option>
                  </select>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Produktname"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 mb-3 text-sm focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="text"
                    placeholder="Beschreibung"
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 mb-3 text-sm focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="number"
                    placeholder="Preis (€)"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    step="0.01"
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 mb-3 text-sm focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="number"
                    placeholder="Lagerbestand"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 mb-3 text-sm focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="text"
                    placeholder="Künstler"
                    value={prodArtist}
                    onChange={(e) => setProdArtist(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 mb-3 text-sm focus:outline-none focus:border-red-600"
                  />
                </>
              )}

              {uploading && (
                <div className="text-center py-3 text-yellow-400 font-black uppercase text-sm">
                  Hochladen...
                </div>
              )}
            </div>
          </div>

          {/* Content List */}
          <div className="md:col-span-2">
            {tab === "galerie" ? (
              <>
                <h2 className="font-black uppercase mb-4 text-sm tracking-widest text-gray-400">
                  Alle Bilder ({images.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="relative group bg-gray-900 border border-gray-800"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={img.filename}
                          alt={img.title}
                          fill
                          className="object-cover"
                        />
                        {img.featured && (
                          <div className="absolute top-1 left-1 bg-yellow-400 text-black text-xs font-black px-1">
                            ★
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-black uppercase truncate">
                          {img.title}
                        </p>
                        <p className="text-xs text-gray-500 uppercase">
                          {img.category}
                        </p>
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => toggleFeatured(img)}
                            className={`flex-1 py-1 text-xs font-black uppercase ${
                              img.featured
                                ? "bg-yellow-400 text-black"
                                : "border border-gray-700 text-gray-500 hover:border-yellow-400 hover:text-yellow-400"
                            }`}
                          >
                            {img.featured ? "★ Top" : "☆ Top"}
                          </button>
                          <button
                            onClick={() => deleteImage(img.id)}
                            className="flex-1 py-1 text-xs font-black uppercase border border-gray-700 text-gray-500 hover:border-red-600 hover:text-red-500"
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="font-black uppercase mb-4 text-sm tracking-widest text-gray-400">
                  Alle Produkte ({products.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-gray-900 border border-gray-800 p-3"
                    >
                      <div className="relative aspect-square mb-2 bg-gray-800">
                        <Image
                          src={prod.filename}
                          alt={prod.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-xs font-black uppercase truncate">
                        {prod.name}
                      </p>
                      <p className="text-yellow-400 text-xs font-bold">
                        {prod.price.toFixed(2)} €
                      </p>
                      <p className="text-gray-500 text-xs">
                        Lager: {prod.stock}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

          {/* TEXTE TAB */}
          {tab === "texte" && (
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black uppercase text-sm tracking-widest text-gray-400">
                  Website Texte bearbeiten
                </h2>
                <button
                  onClick={saveContent}
                  className={`px-6 py-2 font-black uppercase text-sm tracking-widest transition-colors ${
                    contentSaved
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white hover:bg-red-500"
                  }`}
                >
                  {contentSaved ? "✓ Gespeichert!" : "Speichern"}
                </button>
              </div>

              <div className="space-y-6">
                {/* Hero */}
                <div className="bg-gray-950 border border-gray-800 p-6">
                  <h3 className="font-black uppercase text-xs tracking-widest text-red-500 mb-4">Startseite — Hero</h3>
                  <div className="grid md:grid-cols-3 gap-3 mb-3">
                    {["hero_title_1", "hero_title_2", "hero_title_3"].map((key, i) => (
                      <div key={key}>
                        <label className="block text-gray-500 text-xs uppercase mb-1">Titel Zeile {i + 1}</label>
                        <input
                          type="text"
                          value={content[key] || ""}
                          onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={content.hero_badge || ""}
                      onChange={(e) => setContent({ ...content, hero_badge: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Untertitel</label>
                    <textarea
                      value={content.hero_subtitle || ""}
                      onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-500 text-xs uppercase mb-1">Button: Galerie</label>
                      <input
                        type="text"
                        value={content.hero_btn_galerie || ""}
                        onChange={(e) => setContent({ ...content, hero_btn_galerie: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs uppercase mb-1">Button: Shop</label>
                      <input
                        type="text"
                        value={content.hero_btn_shop || ""}
                        onChange={(e) => setContent({ ...content, hero_btn_shop: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Laufband */}
                <div className="bg-gray-950 border border-gray-800 p-6">
                  <h3 className="font-black uppercase text-xs tracking-widest text-red-500 mb-4">Laufband (roter Streifen)</h3>
                  <input
                    type="text"
                    value={content.marquee_text || ""}
                    onChange={(e) => setContent({ ...content, marquee_text: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                  />
                </div>

                {/* Shop Teaser */}
                <div className="bg-gray-950 border border-gray-800 p-6">
                  <h3 className="font-black uppercase text-xs tracking-widest text-red-500 mb-4">Startseite — Shop Bereich</h3>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Titel</label>
                    <input
                      type="text"
                      value={content.shop_title || ""}
                      onChange={(e) => setContent({ ...content, shop_title: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase mb-1">Text</label>
                    <textarea
                      value={content.shop_text || ""}
                      onChange={(e) => setContent({ ...content, shop_text: e.target.value })}
                      rows={2}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Galerie */}
                <div className="bg-gray-950 border border-gray-800 p-6">
                  <h3 className="font-black uppercase text-xs tracking-widest text-red-500 mb-4">Galerie Seite</h3>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Untertitel</label>
                    <input
                      type="text"
                      value={content.galerie_subtitle || ""}
                      onChange={(e) => setContent({ ...content, galerie_subtitle: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {/* Über uns */}
                <div className="bg-gray-950 border border-gray-800 p-6">
                  <h3 className="font-black uppercase text-xs tracking-widest text-red-500 mb-4">Über uns — Startseite</h3>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Badge</label>
                    <input type="text" value={content.about_badge || ""} onChange={(e) => setContent({ ...content, about_badge: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Titel</label>
                    <input type="text" value={content.about_title || ""} onChange={(e) => setContent({ ...content, about_title: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Text 1</label>
                    <textarea value={content.about_text || ""} onChange={(e) => setContent({ ...content, about_text: e.target.value })} rows={3}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase mb-1">Text 2</label>
                    <textarea value={content.about_text_2 || ""} onChange={(e) => setContent({ ...content, about_text_2: e.target.value })} rows={3}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
                  </div>
                </div>

                {/* Kontakt & Social */}
                <div className="bg-gray-950 border border-gray-800 p-6">
                  <h3 className="font-black uppercase text-xs tracking-widest text-red-500 mb-4">Kontakt & Social Media</h3>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Instagram Handle (z.B. @klebengegendrechts)</label>
                    <input type="text" value={content.contact_instagram || ""} onChange={(e) => setContent({ ...content, contact_instagram: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">E-Mail Adresse</label>
                    <input type="text" value={content.contact_email || ""} onChange={(e) => setContent({ ...content, contact_email: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase mb-1">Kontakt Text</label>
                    <textarea value={content.contact_text || ""} onChange={(e) => setContent({ ...content, contact_text: e.target.value })} rows={2}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
                  </div>
                </div>

                {/* SEO Meta */}
                <div className="bg-gray-950 border border-gray-800 p-6">
                  <h3 className="font-black uppercase text-xs tracking-widest text-red-500 mb-1">SEO — Meta Titel & Beschreibung</h3>
                  <p className="text-gray-600 text-xs mb-4">Diese Texte erscheinen in Google-Suchergebnissen.</p>
                  {[
                    { label: "Startseite — Titel", key: "seo_home_title" },
                    { label: "Startseite — Beschreibung", key: "seo_home_description" },
                    { label: "Galerie — Titel", key: "seo_galerie_title" },
                    { label: "Galerie — Beschreibung", key: "seo_galerie_description" },
                    { label: "Shop — Titel", key: "seo_shop_title" },
                    { label: "Shop — Beschreibung", key: "seo_shop_description" },
                  ].map(({ label, key }) => (
                    <div key={key} className="mb-3">
                      <label className="block text-gray-500 text-xs uppercase mb-1">{label}</label>
                      <input type="text" value={content[key] || ""} onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
                    </div>
                  ))}
                </div>

                {/* SEO Texte */}
                <div className="bg-gray-950 border border-gray-800 p-6">
                  <h3 className="font-black uppercase text-xs tracking-widest text-red-500 mb-1">SEO — Inhaltstexte</h3>
                  <p className="text-gray-600 text-xs mb-4">Längere Texte am Ende jeder Seite — gut für Google.</p>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Startseite SEO Text</label>
                    <textarea value={content.seo_text_home || ""} onChange={(e) => setContent({ ...content, seo_text_home: e.target.value })} rows={4}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                      placeholder="Keyword-reicher Text der unten auf der Seite erscheint..." />
                  </div>
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Galerie SEO Text</label>
                    <textarea value={content.seo_text_galerie || ""} onChange={(e) => setContent({ ...content, seo_text_galerie: e.target.value })} rows={4}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                      placeholder="Text über die Galerie für Suchmaschinen..." />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase mb-1">Shop SEO Text</label>
                    <textarea value={content.seo_text_shop || ""} onChange={(e) => setContent({ ...content, seo_text_shop: e.target.value })} rows={4}
                      className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                      placeholder="Text über den Shop für Suchmaschinen..." />
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-950 border border-gray-800 p-6">
                  <h3 className="font-black uppercase text-xs tracking-widest text-red-500 mb-4">Footer</h3>
                  <input type="text" value={content.footer_text || ""} onChange={(e) => setContent({ ...content, footer_text: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600" />
                </div>

                <button
                  onClick={saveContent}
                  className={`w-full py-4 font-black uppercase tracking-widest transition-colors ${
                    contentSaved ? "bg-green-600 text-white" : "bg-red-600 text-white hover:bg-red-500"
                  }`}
                >
                  {contentSaved ? "✓ Gespeichert!" : "Alle Texte speichern"}
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

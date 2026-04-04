"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const BlogEditor = dynamic(() => import("@/components/BlogEditor"), { ssr: false });

interface GalleryImage {
  id: string;
  title: string;
  filename: string;
  category: string;
  featured: boolean;
}

interface ProductImage {
  id: string;
  url: string;
  position: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  filename: string;
  price: number;
  stock: number;
  artist: string;
  active: boolean;
  images: ProductImage[];
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  published: boolean;
  createdAt: string;
}

interface BlogDraft {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  sources: string;
  published: boolean;
}

type Tab = "galerie" | "shop" | "blog" | "texte";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("galerie");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});
  const [contentSaved, setContentSaved] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraImgRef = useRef<HTMLInputElement>(null);
  const [extraUploading, setExtraUploading] = useState(false);

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [blogDraft, setBlogDraft] = useState<BlogDraft>({
    title: "",
    content: "",
    excerpt: "",
    category: "antifaschismus",
    sources: "",
    published: false,
  });
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogMode, setBlogMode] = useState<"list" | "new" | "edit">("list");

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
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodCreating, setProdCreating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      loadImages();
      loadProducts();
      loadBlogPosts();
      fetch("/api/content").then((r) => r.json()).then(setContent);
    }
  }, [session]);

  const loadBlogPosts = () =>
    fetch("/api/blog?all=1").then((r) => r.json()).then((data) => {
      setBlogPosts(Array.isArray(data) ? data : []);
    });

  const saveBlogPost = async () => {
    if (!blogDraft.title.trim()) return;
    setBlogSaving(true);
    if (blogMode === "new") {
      await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogDraft),
      });
    } else if (blogMode === "edit" && editingPost) {
      await fetch(`/api/blog/${editingPost.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogDraft),
      });
    }
    setBlogSaving(false);
    setBlogMode("list");
    setEditingPost(null);
    setBlogDraft({ title: "", content: "", excerpt: "", category: "antifaschismus", sources: "", published: false });
    loadBlogPosts();
  };

  const deleteBlogPost = async (slug: string) => {
    if (!confirm("Beitrag löschen?")) return;
    await fetch(`/api/blog/${slug}`, { method: "DELETE" });
    loadBlogPosts();
  };

  const startEditPost = (post: BlogPost) => {
    fetch(`/api/blog/${post.slug}`).then((r) => r.json()).then((data) => {
      setEditingPost(post);
      setBlogDraft({
        title: data.title || "",
        content: data.content || "",
        excerpt: data.excerpt || "",
        category: data.category || "antifaschismus",
        sources: data.sources || "",
        published: data.published ?? false,
      });
      setBlogMode("edit");
    });
  };

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
    fetch("/api/products").then((r) => r.json()).then((data) => setProducts(Array.isArray(data) ? data : []));

  const saveProduct = async () => {
    if (!editProduct) return;
    await fetch(`/api/products/${editProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editProduct),
    });
    setEditProduct(null);
    loadProducts();
  };

  const addExtraImage = async (file: File) => {
    if (!editProduct) return;
    setExtraUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload-blog-image", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      await fetch(`/api/products/${editProduct.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: data.url }),
      });
      // Reload product images
      const updated = await fetch(`/api/products/${editProduct.id}`).then((r) => r.json());
      setEditProduct(updated);
      loadProducts();
    }
    setExtraUploading(false);
    if (extraImgRef.current) extraImgRef.current.value = "";
  };

  const deleteExtraImage = async (imageId: string) => {
    if (!editProduct) return;
    await fetch(`/api/products/${editProduct.id}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId }),
    });
    const updated = await fetch(`/api/products/${editProduct.id}`).then((r) => r.json());
    setEditProduct(updated);
    loadProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Produkt löschen?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadProducts();
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    if (tab === "galerie") {
      fd.append("type", "gallery");
      fd.append("title", imgTitle || file.name.replace(/\.[^.]+$/, ""));
      fd.append("description", imgDesc);
      fd.append("category", imgCat);
      await fetch("/api/upload", { method: "POST", body: fd });
      setUploading(false);
      setImgTitle(""); setImgDesc("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadImages();
    } else {
      // For products: only upload image, get URL back, don't create DB entry yet
      const res = await fetch("/api/upload-blog-image", { method: "POST", body: fd });
      const data = await res.json();
      setUploading(false);
      if (data.url) {
        setProdImageUrl(data.url);
        if (!prodName) setProdName(file.name.replace(/\.[^.]+$/, ""));
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const createProduct = async () => {
    if (!prodImageUrl || !prodName.trim()) return;
    setProdCreating(true);
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: prodName,
        description: prodDesc,
        price: prodPrice,
        stock: prodStock,
        artist: prodArtist,
        filename: prodImageUrl,
      }),
    });
    setProdCreating(false);
    setProdName(""); setProdDesc(""); setProdPrice(""); setProdStock("");
    setProdArtist("Kleben Gegen Rechts");
    setProdImageUrl("");
    loadProducts();
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
        <div className="flex gap-2 mb-8 border-b border-gray-800 flex-wrap">
          {(["galerie", "shop", "blog", "texte"] as Tab[]).map((t) => (
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

        {(tab === "galerie" || tab === "shop") && <div className="grid md:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="md:col-span-1">
            <div className="bg-gray-950 border border-gray-800 p-6">
              <h2 className="font-black uppercase mb-4 text-sm tracking-widest text-gray-400">
                {tab === "galerie"
                  ? "Bild hochladen"
                  : prodImageUrl
                  ? "Details eingeben"
                  : "Produktbild hochladen"}
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
                  {/* Bild-Vorschau nach Upload */}
                  {prodImageUrl && (
                    <div className="relative aspect-square mb-3 bg-gray-800 border border-gray-700">
                      <Image src={prodImageUrl} alt="Vorschau" fill className="object-cover" />
                      <button
                        onClick={() => setProdImageUrl("")}
                        className="absolute top-1 right-1 bg-black/70 text-white font-black text-xs px-2 py-1 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {!prodImageUrl && (
                    <p className="text-gray-600 text-xs mb-3 text-center">
                      ↑ Zuerst Bild hochladen, dann Details ausfüllen
                    </p>
                  )}
                  <input
                    type="text"
                    placeholder="Produktname *"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 mb-3 text-sm focus:outline-none focus:border-red-600"
                  />
                  <div className="mb-3">
                    <label className="block text-gray-500 text-xs uppercase mb-1">Beschreibung</label>
                    <BlogEditor content={prodDesc} onChange={setProdDesc} />
                  </div>
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
                  <button
                    onClick={createProduct}
                    disabled={!prodImageUrl || !prodName.trim() || prodCreating}
                    className="w-full py-3 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {prodCreating ? "Wird erstellt..." : "Produkt erstellen"}
                  </button>
                </>
              )}

              {uploading && (
                <div className="text-center py-3 text-yellow-400 font-black uppercase text-sm">
                  Bild wird hochgeladen...
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
                    <div key={prod.id} className="bg-gray-900 border border-gray-800">
                      <div className="relative aspect-square bg-gray-800">
                        <Image src={prod.filename} alt={prod.name} fill className="object-cover" />
                        {prod.stock === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-red-600 text-white text-xs font-black px-2 py-1 uppercase">Ausverkauft</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-black uppercase truncate">{prod.name}</p>
                        <p className="text-yellow-400 text-xs font-bold">{prod.price.toFixed(2)} €</p>
                        <p className="text-gray-500 text-xs mb-2">Lager: {prod.stock} | {prod.active ? "Aktiv" : "Inaktiv"}</p>
                        <div className="flex gap-1">
                          <button onClick={() => setEditProduct({ ...prod, images: prod.images || [] })}
                            className="flex-1 py-1 text-xs font-black uppercase bg-yellow-400 text-black hover:bg-yellow-300 transition-colors">
                            Bearbeiten
                          </button>
                          <button onClick={() => deleteProduct(prod.id)}
                            className="flex-1 py-1 text-xs font-black uppercase border border-gray-700 text-gray-500 hover:border-red-600 hover:text-red-500 transition-colors">
                            Löschen
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>}

          {/* BLOG TAB */}
          {tab === "blog" && (
            <div>
              {blogMode === "list" ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-black uppercase text-sm tracking-widest text-gray-400">
                      Blog Beiträge ({blogPosts.length})
                    </h2>
                    <button
                      onClick={() => { setBlogMode("new"); setBlogDraft({ title: "", content: "", excerpt: "", category: "antifaschismus", sources: "", published: false }); }}
                      className="px-6 py-2 bg-red-600 text-white font-black uppercase text-sm tracking-widest hover:bg-red-500 transition-colors"
                    >
                      + Neuer Beitrag
                    </button>
                  </div>
                  {blogPosts.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-700">
                      <p className="text-gray-500 font-bold uppercase">Noch keine Beiträge</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {blogPosts.map((post) => (
                        <div key={post.id} className="bg-gray-950 border border-gray-800 p-4 flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 text-xs font-black uppercase ${post.published ? "bg-green-600 text-white" : "bg-gray-700 text-gray-400"}`}>
                                {post.published ? "Veröffentlicht" : "Entwurf"}
                              </span>
                              <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs font-black uppercase">
                                {post.category}
                              </span>
                            </div>
                            <p className="font-black uppercase truncate">{post.title}</p>
                            <p className="text-gray-600 text-xs">{new Date(post.createdAt).toLocaleDateString("de-DE")}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEditPost(post)}
                              className="px-4 py-2 bg-yellow-400 text-black font-black uppercase text-xs hover:bg-yellow-300 transition-colors"
                            >
                              Bearbeiten
                            </button>
                            <button
                              onClick={() => deleteBlogPost(post.slug)}
                              className="px-4 py-2 border border-gray-700 text-gray-500 font-black uppercase text-xs hover:border-red-600 hover:text-red-500 transition-colors"
                            >
                              Löschen
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-black uppercase text-sm tracking-widest text-gray-400">
                      {blogMode === "new" ? "Neuer Beitrag" : "Beitrag bearbeiten"}
                    </h2>
                    <button
                      onClick={() => { setBlogMode("list"); setEditingPost(null); }}
                      className="px-4 py-2 border border-gray-700 text-gray-400 font-black uppercase text-xs hover:text-white hover:border-white transition-colors"
                    >
                      ← Zurück
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-500 text-xs uppercase mb-1">Titel *</label>
                      <input
                        type="text"
                        value={blogDraft.title}
                        onChange={(e) => setBlogDraft({ ...blogDraft, title: e.target.value })}
                        placeholder="Titel des Beitrags..."
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-500 text-xs uppercase mb-1">Kategorie</label>
                        <select
                          value={blogDraft.category}
                          onChange={(e) => setBlogDraft({ ...blogDraft, category: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                        >
                          <option value="antifaschismus">Antifaschismus</option>
                          <option value="polizeigewalt">Polizeigewalt</option>
                          <option value="linke-themen">Linke Themen</option>
                          <option value="news">Aktuelle News</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-3 cursor-pointer"
                          onClick={() => setBlogDraft({ ...blogDraft, published: !blogDraft.published })}>
                          <div className={`w-12 h-6 rounded-full transition-colors relative ${blogDraft.published ? "bg-green-600" : "bg-gray-700"}`}>
                            <div className={`absolute top-0 w-6 h-6 bg-white rounded-full transition-transform shadow ${blogDraft.published ? "translate-x-6" : "translate-x-0"}`} />
                          </div>
                          <span className="font-black uppercase text-sm">
                            {blogDraft.published ? "Veröffentlicht" : "Entwurf"}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-500 text-xs uppercase mb-1">Kurzbeschreibung (Vorschau)</label>
                      <textarea
                        value={blogDraft.excerpt}
                        onChange={(e) => setBlogDraft({ ...blogDraft, excerpt: e.target.value })}
                        rows={2}
                        placeholder="Kurze Zusammenfassung, erscheint in der Übersicht..."
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 text-xs uppercase mb-2">Inhalt</label>
                      <BlogEditor
                        content={blogDraft.content}
                        onChange={(html) => setBlogDraft({ ...blogDraft, content: html })}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-500 text-xs uppercase mb-1">Quellen (eine pro Zeile, URLs oder Text)</label>
                      <textarea
                        value={blogDraft.sources}
                        onChange={(e) => setBlogDraft({ ...blogDraft, sources: e.target.value })}
                        rows={4}
                        placeholder={"https://tagesschau.de/...\nhttps://nd-aktuell.de/...\nBuch: Autor, Titel, Jahr"}
                        className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600 font-mono"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={saveBlogPost}
                        disabled={blogSaving || !blogDraft.title.trim()}
                        className="flex-1 py-4 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {blogSaving ? "Speichern..." : blogMode === "new" ? "Beitrag erstellen" : "Beitrag speichern"}
                      </button>
                      <button
                        onClick={() => { setBlogMode("list"); setEditingPost(null); }}
                        className="px-6 py-4 border border-gray-700 text-gray-400 font-black uppercase hover:border-white hover:text-white transition-colors"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

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

      {/* Produkt Edit Modal */}
      {editProduct && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setEditProduct(null)}>
          <div className="w-full max-w-lg bg-gray-950 border-2 border-yellow-400 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: "6px 6px 0px #ff0033" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black uppercase text-lg">Produkt bearbeiten</h2>
              <button onClick={() => setEditProduct(null)} className="font-black hover:text-red-500">✕</button>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="relative w-24 h-24 shrink-0 bg-gray-800">
                <Image src={editProduct.filename} alt={editProduct.name} fill className="object-cover" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-gray-500 text-xs uppercase mb-1">Produktname</label>
                  <input type="text" value={editProduct.name}
                    onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="block text-gray-500 text-xs uppercase mb-1">Künstler</label>
                  <input type="text" value={editProduct.artist}
                    onChange={(e) => setEditProduct({ ...editProduct, artist: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-gray-500 text-xs uppercase mb-1">Beschreibung</label>
              <BlogEditor
                content={editProduct.description || ""}
                onChange={(html) => setEditProduct({ ...editProduct, description: html })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-gray-500 text-xs uppercase mb-1">Preis (€)</label>
                <input type="number" step="0.01" value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="block text-gray-500 text-xs uppercase mb-1">Lagerbestand</label>
                <input type="number" value={editProduct.stock}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
            </div>

            {/* Weitere Fotos */}
            <div className="mb-6">
              <label className="block text-gray-500 text-xs uppercase mb-2">Weitere Fotos</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {/* Cover-Bild */}
                <div className="relative w-20 h-20 border-2 border-yellow-400 bg-gray-800 shrink-0">
                  <Image src={editProduct.filename} alt="Cover" fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-yellow-400 text-black text-[9px] font-black text-center">COVER</div>
                </div>
                {/* Extra Bilder */}
                {editProduct.images.map((img) => (
                  <div key={img.id} className="relative w-20 h-20 border border-gray-700 bg-gray-800 group shrink-0">
                    <Image src={img.url} alt="Foto" fill className="object-cover" />
                    <button
                      onClick={() => deleteExtraImage(img.id)}
                      className="absolute top-0 right-0 bg-red-600 text-white text-xs font-black w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {/* Upload-Button */}
                <button
                  onClick={() => extraImgRef.current?.click()}
                  disabled={extraUploading}
                  className="w-20 h-20 border-2 border-dashed border-gray-600 hover:border-red-500 text-gray-500 hover:text-red-500 flex flex-col items-center justify-center text-xs font-black uppercase transition-colors disabled:opacity-50"
                >
                  {extraUploading ? "..." : <>
                    <span className="text-2xl">+</span>
                    <span>Foto</span>
                  </>}
                </button>
                <input
                  ref={extraImgRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) addExtraImage(f); }}
                />
              </div>
              <p className="text-gray-600 text-xs">Über das Cover-Bild schwebt "COVER". Weitere Fotos erscheinen als Galerie auf der Produktseite.</p>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer"
                onClick={() => setEditProduct({ ...editProduct, active: !editProduct.active })}>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${editProduct.active ? "bg-green-600" : "bg-gray-700"}`}>
                  <div className={`absolute top-0 w-6 h-6 bg-white rounded-full transition-transform shadow ${editProduct.active ? "translate-x-6" : "translate-x-0"}`} />
                </div>
                <span className="font-black uppercase text-sm">
                  {editProduct.active ? "Aktiv — im Shop sichtbar" : "Inaktiv — versteckt"}
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button onClick={saveProduct}
                className="flex-1 py-3 bg-yellow-400 text-black font-black uppercase tracking-widest hover:bg-yellow-300 transition-colors">
                Speichern
              </button>
              <button onClick={() => setEditProduct(null)}
                className="flex-1 py-3 border border-gray-700 text-gray-400 font-black uppercase hover:border-white hover:text-white transition-colors">
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

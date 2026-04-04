"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  createdAt: string;
}

const CATEGORIES = [
  { value: "alle", label: "Alle Themen" },
  { value: "antifaschismus", label: "Antifaschismus" },
  { value: "polizeigewalt", label: "Polizeigewalt" },
  { value: "linke-themen", label: "Linke Themen" },
  { value: "news", label: "Aktuelle News" },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("alle");

  useEffect(() => {
    setLoading(true);
    const url = category === "alle" ? "/api/blog" : `/api/blog?category=${category}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [category]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const categoryLabel = (val: string) =>
    CATEGORIES.find((c) => c.value === val)?.label || val;

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-block mb-3 px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest">
            Blog
          </div>
          <h1 className="text-5xl font-black uppercase">
            News &amp; <span className="text-yellow-400">Analysen</span>
          </h1>
          <p className="text-gray-400 mt-3 max-w-xl">
            Antifaschistische Berichte, Analysen zu Polizeigewalt und linke Themen — direkt aus der Bewegung.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest border transition-colors ${
                category === cat.value
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-gray-700 text-gray-400 hover:border-white hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-bold uppercase">
            Laden...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-700">
            <div className="text-6xl mb-4">✊</div>
            <p className="text-gray-500 font-bold uppercase text-xl">
              Noch keine Beiträge
            </p>
            <p className="text-gray-600 mt-2">
              Beiträge können im Admin-Panel erstellt werden.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id} className="group">
                <article className="bg-gray-950 border border-gray-800 hover:border-red-600 transition-colors h-full flex flex-col">
                  {post.coverImage ? (
                    <div className="relative aspect-video overflow-hidden bg-gray-900">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-900 flex items-center justify-center border-b border-gray-800">
                      <span className="text-4xl">✊</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-black uppercase">
                        {categoryLabel(post.category)}
                      </span>
                      <span className="text-gray-600 text-xs">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <h2 className="font-black uppercase text-lg leading-tight mb-2 group-hover:text-red-500 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-400 text-sm leading-relaxed flex-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="mt-4 text-red-500 text-xs font-black uppercase tracking-widest">
                      Weiterlesen →
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  sources?: string;
  createdAt: string;
}

const categoryLabel: Record<string, string> = {
  antifaschismus: "Antifaschismus",
  polizeigewalt: "Polizeigewalt",
  "linke-themen": "Linke Themen",
  news: "Aktuelle News",
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => {
        if (!r.ok) router.push("/blog");
        return r.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => router.push("/blog"));
  }, [slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-500 font-black uppercase">Laden...</p>
      </div>
    );
  }

  if (!post) return null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const sources = post.sources
    ? post.sources.split("\n").filter((s) => s.trim())
    : [];

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600 text-xs uppercase font-bold mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-[200px]">{post.title}</span>
        </div>

        {/* Category + Date */}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase">
            {categoryLabel[post.category] || post.category}
          </span>
          <span className="text-gray-500 text-sm">{formatDate(post.createdAt)}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black uppercase leading-tight mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-300 leading-relaxed mb-8 border-l-4 border-yellow-400 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {post.coverImage && (
          <div
            className="relative w-full aspect-video mb-10 border-2 border-gray-800"
            style={{ boxShadow: "6px 6px 0px #ff0033" }}
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-content prose prose-invert max-w-none text-gray-200 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-12 border-t border-gray-800 pt-8">
            <h3 className="font-black uppercase text-sm tracking-widest text-gray-500 mb-4">
              Quellen
            </h3>
            <ul className="space-y-2">
              {sources.map((src, i) => {
                const isUrl = src.startsWith("http");
                return (
                  <li key={i} className="text-sm text-gray-400 flex gap-2">
                    <span className="text-gray-600 shrink-0">[{i + 1}]</span>
                    {isUrl ? (
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300 underline break-all"
                      >
                        {src}
                      </a>
                    ) : (
                      <span>{src}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Back */}
        <div className="mt-12">
          <Link
            href="/blog"
            className="inline-block px-6 py-3 border border-gray-700 text-gray-400 font-black uppercase text-sm hover:border-white hover:text-white transition-colors"
          >
            ← Zurück zum Blog
          </Link>
        </div>
      </div>
    </div>
  );
}

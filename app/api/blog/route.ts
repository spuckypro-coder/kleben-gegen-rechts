import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewsletterBlogPost } from "@/lib/resend";
import slugify from "slugify";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const all = searchParams.get("all"); // admin: get all including unpublished

  const session = await getServerSession(authOptions);
  const isAdmin = !!session;

  const where: Record<string, unknown> = {};
  if (!isAdmin || !all) {
    where.published = true;
    where.OR = [{ publishedAt: null }, { publishedAt: { lte: new Date() } }];
  }
  if (category && category !== "alle") where.category = category;

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      category: true,
      published: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await request.json();
  const slug = slugify(body.title || "beitrag", {
    lower: true,
    strict: true,
    locale: "de",
  });

  // ensure unique slug
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  const isLiveNow = body.published && (!publishedAt || publishedAt <= new Date());

  const post = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug: finalSlug,
      content: body.content || "",
      excerpt: body.excerpt || "",
      coverImage: body.coverImage || null,
      category: body.category || "antifaschismus",
      sources: body.sources || "",
      published: body.published ?? false,
      publishedAt,
    },
  });

  if (isLiveNow) {
    sendNewsletterBlogPost({ title: post.title, slug: post.slug, excerpt: post.excerpt ?? undefined }).catch(() => {});
  }

  return NextResponse.json(post);
}

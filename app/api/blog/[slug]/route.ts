import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewsletterBlogPost } from "@/lib/resend";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  const now = new Date();
  const isLive = post?.published && (!post.publishedAt || post.publishedAt <= now);
  if (!post || !isLive) {
    const session = await getServerSession(authOptions);
    if (!session || !post) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }
  }
  return NextResponse.json(post);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json();

  // Check previous state to detect draft → published transition
  const before = await prisma.blogPost.findUnique({ where: { slug } });
  const wasLive = before?.published && (!before.publishedAt || before.publishedAt <= new Date());

  const publishedAt = body.publishedAt !== undefined
    ? (body.publishedAt ? new Date(body.publishedAt) : null)
    : before?.publishedAt ?? null;

  const post = await prisma.blogPost.update({
    where: { slug },
    data: {
      title: body.title,
      content: body.content,
      excerpt: body.excerpt,
      coverImage: body.coverImage,
      category: body.category,
      sources: body.sources,
      published: body.published,
      publishedAt: body.publishedAt !== undefined
        ? (body.publishedAt ? new Date(body.publishedAt) : null)
        : undefined,
    },
  });

  const isLiveNow = post.published && (!publishedAt || publishedAt <= new Date());
  if (!wasLive && isLiveNow) {
    sendNewsletterBlogPost({ title: post.title, slug: post.slug, excerpt: post.excerpt ?? undefined }).catch(() => {});
  }

  return NextResponse.json(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { slug } = await params;
  await prisma.blogPost.delete({ where: { slug } });
  return NextResponse.json({ success: true });
}

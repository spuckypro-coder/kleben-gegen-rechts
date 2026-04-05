import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback");

async function getPublicUser(req: NextRequest) {
  const token = req.cookies.get("public_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string; name: string; email: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("slug");
  if (!postSlug) return NextResponse.json([]);

  const comments = await prisma.comment.findMany({
    where: { postSlug },
    orderBy: { createdAt: "asc" },
    select: { id: true, authorName: true, content: true, createdAt: true, userId: true },
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const { postSlug, content } = await req.json();
  if (!postSlug || !content?.trim()) {
    return NextResponse.json({ error: "Fehlende Felder" }, { status: 400 });
  }

  // Check NextAuth admin session first
  const session = await getServerSession(authOptions);
  if (session?.user) {
    const comment = await prisma.comment.create({
      data: {
        postSlug,
        content: content.trim(),
        authorName: (session.user as any).name || session.user.email || "Admin",
        userId: null,
      },
      select: { id: true, authorName: true, content: true, createdAt: true, userId: true },
    });
    return NextResponse.json(comment);
  }

  // Check public user session
  const publicUser = await getPublicUser(req);
  if (!publicUser) {
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
  }

  const comment = await prisma.comment.create({
    data: {
      postSlug,
      content: content.trim(),
      authorName: publicUser.name,
      userId: publicUser.id,
    },
    select: { id: true, authorName: true, content: true, createdAt: true, userId: true },
  });

  return NextResponse.json(comment);
}

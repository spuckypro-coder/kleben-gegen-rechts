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

// PATCH — edit comment (admin or own comment)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Inhalt fehlt" }, { status: 400 });
  }

  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const session = await getServerSession(authOptions);
  if (session?.user) {
    // Admin can edit any comment
    const updated = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      select: { id: true, authorName: true, content: true, createdAt: true, userId: true },
    });
    return NextResponse.json(updated);
  }

  const publicUser = await getPublicUser(req);
  if (!publicUser || comment.userId !== publicUser.id) {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: { content: content.trim() },
    select: { id: true, authorName: true, content: true, createdAt: true, userId: true },
  });
  return NextResponse.json(updated);
}

// DELETE — admin only
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Nur Admins können Kommentare löschen" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

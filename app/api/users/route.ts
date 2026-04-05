import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function isAdmin(session: Awaited<ReturnType<typeof getServerSession>>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session as any)?.user?.role === "admin";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, lastSeen: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const { name, email, password, role } = await request.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Alle Felder erforderlich" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-Mail bereits vergeben" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(user);
}

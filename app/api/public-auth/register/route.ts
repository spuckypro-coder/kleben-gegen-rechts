import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback");

export async function POST(req: NextRequest) {
  const { name, email, password, newsletter } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Alle Felder erforderlich" }, { status: 400 });
  }

  const existing = await prisma.publicUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-Mail bereits vergeben" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.publicUser.create({
    data: { name, email, password: hashed, newsletter: newsletter ?? true },
    select: { id: true, name: true, email: true, newsletter: true },
  });

  if (user.newsletter) {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true, name },
      create: { email, name, active: true },
    });
  }

  const token = await new SignJWT({ id: user.id, name: user.name, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);

  const res = NextResponse.json({ user });
  res.cookies.set("public_session", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}

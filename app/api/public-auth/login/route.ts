import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback");

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "E-Mail und Passwort erforderlich" }, { status: 400 });
  }

  const user = await prisma.publicUser.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 });
  }

  const token = await new SignJWT({ id: user.id, name: user.name, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);

  const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
  res.cookies.set("public_session", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("public_session")?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const { payload } = await jwtVerify(token, secret);
    return NextResponse.json({ user: { id: payload.id, name: payload.name, email: payload.email } });
  } catch {
    return NextResponse.json({ user: null });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ ok: false });

  await prisma.user.update({
    where: { email: session.user.email },
    data: { lastSeen: new Date() },
  });

  return NextResponse.json({ ok: true });
}

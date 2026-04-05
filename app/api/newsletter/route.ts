import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();
  if (!email) return NextResponse.json({ error: "E-Mail erforderlich" }, { status: 400 });

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { active: true, name: name || null },
    create: { email, name: name || null, active: true },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ error: "E-Mail erforderlich" }, { status: 400 });

  await prisma.newsletterSubscriber.updateMany({
    where: { email },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}

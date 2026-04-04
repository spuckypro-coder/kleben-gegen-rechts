import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.siteContent.findMany();
  const content: Record<string, string> = {};
  items.forEach((item) => {
    content[item.key] = item.value;
  });
  return NextResponse.json(content);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await request.json();

  for (const [key, value] of Object.entries(body)) {
    await prisma.siteContent.upsert({
      where: { key },
      update: { value: value as string },
      create: { key, value: value as string },
    });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const images = await prisma.galleryImage.findMany({
    where: category && category !== "alle" ? { category } : undefined,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(images);
}

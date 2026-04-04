import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const image = await prisma.galleryImage.findUnique({
    where: { id: params.id },
  });

  if (!image) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "gallery",
      image.filename
    );
    await unlink(filePath);
  } catch {}

  await prisma.galleryImage.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await request.json();

  const image = await prisma.galleryImage.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(image);
}

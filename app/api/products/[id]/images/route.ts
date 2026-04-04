import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const { id } = await params;
  const { url } = await request.json();

  const count = await prisma.productImage.count({ where: { productId: id } });

  const image = await prisma.productImage.create({
    data: { productId: id, url, position: count },
  });

  return NextResponse.json(image);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });

  const { id } = await params;
  const { imageId } = await request.json();

  await prisma.productImage.delete({ where: { id: imageId, productId: id } });
  return NextResponse.json({ success: true });
}

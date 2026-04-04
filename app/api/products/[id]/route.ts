import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id, active: true } });
  if (!product) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      price: parseFloat(body.price) || 0,
      stock: parseInt(body.stock) || 0,
      artist: body.artist,
      active: body.active,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (product?.filename.includes("cloudinary.com")) {
    try {
      const publicId = product.filename
        .split("/upload/")[1]
        .replace(/v\d+\//, "")
        .replace(/\.[^.]+$/, "");
      await cloudinary.uploader.destroy(publicId);
    } catch {}
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

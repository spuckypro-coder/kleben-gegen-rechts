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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const { id } = await params;

  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  }

  // Delete from Cloudinary if it's a Cloudinary URL
  if (image.filename.includes("cloudinary.com")) {
    try {
      const publicId = image.filename
        .split("/upload/")[1]
        .replace(/v\d+\//, "")
        .replace(/\.[^.]+$/, "");
      await cloudinary.uploader.destroy(publicId);
    } catch {}
  }

  await prisma.galleryImage.delete({ where: { id } });
  return NextResponse.json({ success: true });
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

  const image = await prisma.galleryImage.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(image);
}

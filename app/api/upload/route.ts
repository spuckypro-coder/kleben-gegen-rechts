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

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const price = formData.get("price") as string;
  const stock = formData.get("stock") as string;
  const artist = formData.get("artist") as string;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const folder = type === "product" ? "kgr/products" : "kgr/gallery";

  const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            transformation: [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }],
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as { secure_url: string; public_id: string });
          }
        )
        .end(buffer);
    }
  );

  const imageUrl = uploadResult.secure_url;

  if (type === "product") {
    const product = await prisma.product.create({
      data: {
        name: title || file.name.replace(/\.[^.]+$/, ""),
        description,
        price: parseFloat(price) || 0,
        filename: imageUrl,
        stock: parseInt(stock) || 0,
        artist: artist || "Kleben Gegen Rechts",
      },
    });
    return NextResponse.json(product);
  } else {
    const image = await prisma.galleryImage.create({
      data: {
        title: title || file.name.replace(/\.[^.]+$/, ""),
        description,
        filename: imageUrl,
        category: category || "allgemein",
      },
    });
    return NextResponse.json(image);
  }
}

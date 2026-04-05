import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewsletterProduct } from "@/lib/resend";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await request.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description || "",
      price: parseFloat(body.price) || 0,
      filename: body.filename,
      stock: parseInt(body.stock) || 0,
      artist: body.artist || "Kleben Gegen Rechts",
    },
  });

  sendNewsletterProduct({ name: product.name, id: product.id, price: product.price }).catch(() => {});

  return NextResponse.json(product);
}

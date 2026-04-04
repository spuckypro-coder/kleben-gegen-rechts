import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

interface CartItem {
  id: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { cart, email, name, address } = body as {
    cart: CartItem[];
    email: string;
    name: string;
    address: string;
  };

  if (!cart || cart.length === 0) {
    return NextResponse.json({ error: "Warenkorb leer" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: cart.map((i) => i.id) }, active: true },
  });

  const lineItems = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) throw new Error(`Produkt nicht gefunden: ${item.id}`);
    return {
      price_data: {
        currency: "eur",
        product_data: {
          name: product.name,
          description: product.artist,
          images: [
            `${process.env.NEXTAUTH_URL}/uploads/products/${product.filename}`,
          ],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.NEXTAUTH_URL}/shop?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/shop?canceled=true`,
    customer_email: email || undefined,
    shipping_address_collection: {
      allowed_countries: ["DE", "AT", "CH"],
    },
    metadata: { name: name || "", address: address || "" },
  });

  return NextResponse.json({ url: session.url });
}

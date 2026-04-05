import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  const { subject, body } = await req.json();
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Betreff und Inhalt erforderlich" }, { status: 400 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { active: true },
  });

  if (!subscribers.length) {
    return NextResponse.json({ error: "Keine aktiven Abonnenten" }, { status: 400 });
  }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:32px;">
      <h1 style="color:#ff6600;font-size:24px;text-transform:uppercase;margin-bottom:24px;">Kleben Gegen Rechts</h1>
      <div style="color:#e0e0e0;font-size:16px;line-height:1.7;white-space:pre-wrap;">${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
      <hr style="border-color:#333;margin:32px 0;" />
      <p style="color:#555;font-size:12px;">Du erhältst diese E-Mail weil du den Newsletter von klebengegenrechts.de abonniert hast.</p>
      <p style="color:#555;font-size:12px;"><a href="https://www.klebengegenrechts.de/newsletter/abmelden" style="color:#555;">Abmelden</a></p>
    </div>
  `;

  await resend.emails.send({
    from: "Kleben Gegen Rechts <newsletter@klebengegenrechts.de>",
    to: subscribers.map((s) => s.email),
    subject: subject.trim(),
    html,
  });

  return NextResponse.json({ ok: true, sent: subscribers.length });
}

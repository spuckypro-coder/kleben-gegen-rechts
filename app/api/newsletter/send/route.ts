import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { emailTemplate, convertBodyHtmlForEmail } from "@/lib/email-template";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
  }

  const { subject, bodyHtml } = await req.json();
  if (!subject?.trim() || !bodyHtml?.trim()) {
    return NextResponse.json({ error: "Betreff und Inhalt erforderlich" }, { status: 400 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { active: true },
  });

  if (!subscribers.length) {
    return NextResponse.json({ error: "Keine aktiven Abonnenten" }, { status: 400 });
  }

  const html = emailTemplate(convertBodyHtmlForEmail(bodyHtml));

  await resend.emails.send({
    from: "Kleben Gegen Rechts <newsletter@klebengegenrechts.de>",
    to: subscribers.map((s) => s.email),
    subject: subject.trim(),
    html,
  });

  return NextResponse.json({ ok: true, sent: subscribers.length });
}

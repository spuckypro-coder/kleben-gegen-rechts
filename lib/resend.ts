import { Resend } from "resend";
import { emailTemplate, emailButton } from "./email-template";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewsletterBlogPost(post: {
  title: string;
  slug: string;
  excerpt?: string;
}) {
  const subscribers = await import("@/lib/prisma").then((m) =>
    m.prisma.newsletterSubscriber.findMany({ where: { active: true } })
  );
  if (!subscribers.length) return;

  const url = `https://www.klebengegenrechts.de/blog/${post.slug}`;

  const content = `
    <p style="margin:0 0 6px 0;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:2px;">Neuer Beitrag</p>
    <h2 style="margin:0 0 16px 0;font-size:22px;font-weight:900;color:#ffffff;text-transform:uppercase;line-height:1.2;">${post.title}</h2>
    ${post.excerpt ? `<p style="margin:0 0 8px 0;color:#aaaaaa;font-size:15px;line-height:1.7;border-left:3px solid #cc0000;padding-left:14px;">${post.excerpt}</p>` : ""}
    ${emailButton("Jetzt lesen →", url)}
  `;

  await resend.batch.send(
    subscribers.map((s) => ({
      from: "Kleben Gegen Rechts <newsletter@klebengegenrechts.de>",
      to: [s.email],
      subject: `Neuer Beitrag: ${post.title}`,
      html: emailTemplate(content),
    }))
  );
}

export async function sendNewsletterProduct(product: {
  name: string;
  id: string;
  price: number;
}) {
  const subscribers = await import("@/lib/prisma").then((m) =>
    m.prisma.newsletterSubscriber.findMany({ where: { active: true } })
  );
  if (!subscribers.length) return;

  const url = `https://www.klebengegenrechts.de/shop/${product.id}`;

  const content = `
    <p style="margin:0 0 6px 0;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:2px;">Neu im Shop</p>
    <h2 style="margin:0 0 12px 0;font-size:22px;font-weight:900;color:#ffffff;text-transform:uppercase;line-height:1.2;">${product.name}</h2>
    <p style="margin:0 0 4px 0;font-size:28px;font-weight:900;color:#f97316;">${product.price.toFixed(2).replace(".", ",")} €</p>
    ${emailButton("Im Shop ansehen →", url)}
  `;

  await resend.batch.send(
    subscribers.map((s) => ({
      from: "Kleben Gegen Rechts <newsletter@klebengegenrechts.de>",
      to: [s.email],
      subject: `Neu im Shop: ${product.name}`,
      html: emailTemplate(content),
    }))
  );
}

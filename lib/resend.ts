import { Resend } from "resend";

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

  await resend.emails.send({
    from: "Kleben Gegen Rechts <newsletter@klebengegenrechts.de>",
    to: subscribers.map((s) => s.email),
    subject: `Neuer Beitrag: ${post.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:32px;">
        <h1 style="color:#ff6600;font-size:24px;text-transform:uppercase;margin-bottom:8px;">Kleben Gegen Rechts</h1>
        <h2 style="font-size:20px;margin-bottom:12px;">${post.title}</h2>
        ${post.excerpt ? `<p style="color:#aaa;margin-bottom:24px;">${post.excerpt}</p>` : ""}
        <a href="${url}" style="display:inline-block;background:#ff0033;color:#fff;font-weight:900;text-transform:uppercase;padding:12px 24px;text-decoration:none;">Jetzt lesen →</a>
        <hr style="border-color:#333;margin:32px 0;" />
        <p style="color:#555;font-size:12px;">Du erhältst diese E-Mail weil du den Newsletter von klebengegenrechts.de abonniert hast.</p>
        <p style="color:#555;font-size:12px;"><a href="https://www.klebengegenrechts.de/newsletter/abmelden" style="color:#555;">Abmelden</a></p>
      </div>
    `,
  });
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

  await resend.emails.send({
    from: "Kleben Gegen Rechts <newsletter@klebengegenrechts.de>",
    to: subscribers.map((s) => s.email),
    subject: `Neues im Shop: ${product.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#000;color:#fff;padding:32px;">
        <h1 style="color:#ff6600;font-size:24px;text-transform:uppercase;margin-bottom:8px;">Kleben Gegen Rechts</h1>
        <h2 style="font-size:20px;margin-bottom:8px;">${product.name}</h2>
        <p style="color:#ff6600;font-size:24px;font-weight:900;margin-bottom:24px;">${product.price.toFixed(2)} €</p>
        <a href="${url}" style="display:inline-block;background:#ff0033;color:#fff;font-weight:900;text-transform:uppercase;padding:12px 24px;text-decoration:none;">Im Shop ansehen →</a>
        <hr style="border-color:#333;margin:32px 0;" />
        <p style="color:#555;font-size:12px;"><a href="https://www.klebengegenrechts.de/newsletter/abmelden" style="color:#555;">Abmelden</a></p>
      </div>
    `,
  });
}

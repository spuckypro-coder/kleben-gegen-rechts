import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewsletterBlogPost } from "@/lib/resend";

export async function GET(req: NextRequest) {
  // Vercel automatically sends this header for cron jobs
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find scheduled posts that are now due and haven't had their newsletter sent
  const now = new Date();
  const duePosts = await prisma.blogPost.findMany({
    where: {
      published: true,
      newsletterSent: false,
      publishedAt: { lte: now },
    },
  });

  for (const post of duePosts) {
    try {
      await sendNewsletterBlogPost({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? undefined,
      });
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { newsletterSent: true },
      });
    } catch {
      // continue with next post if one fails
    }
  }

  return NextResponse.json({ processed: duePosts.length });
}

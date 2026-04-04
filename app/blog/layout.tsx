import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Kleben Gegen Rechts",
  description:
    "Antifaschistische News, Analysen zu Polizeigewalt und linke Themen — direkt aus der Bewegung. Kleben Gegen Rechts berichtet.",
  keywords: [
    "Antifaschismus Blog",
    "Polizeigewalt",
    "linke Themen",
    "Antifa News",
    "Kleben Gegen Rechts",
    "Sticker Aktivismus",
    "Faschismus bekämpfen",
  ],
  openGraph: {
    title: "Blog — Kleben Gegen Rechts",
    description:
      "Antifaschistische News, Analysen zu Polizeigewalt und linke Themen — direkt aus der Bewegung.",
    url: "https://klebengegenrechts.de/blog",
    siteName: "Kleben Gegen Rechts",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Kleben Gegen Rechts",
    description: "Antifaschistische News und Analysen.",
  },
  alternates: {
    canonical: "https://klebengegenrechts.de/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

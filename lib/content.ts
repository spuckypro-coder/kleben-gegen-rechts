import { prisma } from "./prisma";

export const defaultContent: Record<string, string> = {
  // SEO
  seo_home_title: "Kleben Gegen Rechts — Antifaschistische Sticker Kunst",
  seo_home_description: "Sticker Kunst als politisches Statement. Antifaschistische Kunst aus Wien. Kaufe Sticker und zeige Haltung.",
  seo_galerie_title: "Galerie — Kleben Gegen Rechts",
  seo_galerie_description: "Alle Sticker und Kunstwerke von Kleben Gegen Rechts auf einen Blick.",
  seo_shop_title: "Shop — Kleben Gegen Rechts",
  seo_shop_description: "Kaufe antifaschistische Sticker und unterstütze die Kunst direkt.",

  // Hero
  hero_badge: "Antifaschistische Sticker Kunst aus Wien",
  hero_title_1: "KLEBEN",
  hero_title_2: "GEGEN",
  hero_title_3: "RECHTS",
  hero_subtitle: "Sticker sind mehr als Kunst — sie sind Haltung. Jedes Bild, das wir auf die Straße bringen, ist ein sichtbares Zeichen gegen Hass, Hetze und Rechtsruck.",
  hero_btn_galerie: "Zur Galerie",
  hero_btn_shop: "Sticker Kaufen",

  // Laufband
  marquee_text: "KLEBEN GEGEN RECHTS ✊ KEINE TOLERANZ FÜR INTOLERANZ ✊ KUNST IST WIDERSTAND ✊ ANTIFASCHISMUS IST KEINE MEINUNG ✊",

  // Über uns (Startseite)
  about_badge: "Über das Projekt",
  about_title: "Warum wir kleben",
  about_text: "Kleben Gegen Rechts ist ein antifaschistisches Kunstprojekt. Wir glauben daran, dass Kunst Räume schafft — auf Mauern, Laternen und im öffentlichen Bewusstsein. Unsere Sticker sind keine Dekoration. Sie sind eine Ansage.",
  about_text_2: "Gegründet aus der Überzeugung, dass Schweigen keine Option ist. Jedes geklebte Sticker ist ein kleiner Akt des Widerstands gegen Normalisierung von Rechtsextremismus.",

  // Shop Teaser
  shop_badge: "Shop",
  shop_title: "Trag deine Haltung in die Stadt",
  shop_text: "Hochwertige Sticker mit Botschaft. Jeder Kauf unterstützt antifaschistische Kunst und Aktivismus direkt vor Ort.",

  // Galerie Seite
  galerie_title: "Die Galerie",
  galerie_subtitle: "Sticker Kunst als politisches Statement. Jedes Werk erzählt eine Geschichte von Widerstand und Solidarität.",

  // Shop Seite
  shop_page_title: "Sticker Kaufen",
  shop_page_subtitle: "Zeig Haltung — trag die Kunst in deine Stadt.",

  // Kontakt / Social
  contact_instagram: "",
  contact_email: "",
  contact_text: "",

  // SEO Footer / Extra
  seo_text_home: "",
  seo_text_galerie: "",
  seo_text_shop: "",

  // Footer
  footer_text: "Kunst ist Widerstand — seit Tag eins",
};

export async function getContent(): Promise<Record<string, string>> {
  try {
    const items = await prisma.siteContent.findMany();
    const content = { ...defaultContent };
    items.forEach((item) => {
      content[item.key] = item.value;
    });
    return content;
  } catch {
    return defaultContent;
  }
}

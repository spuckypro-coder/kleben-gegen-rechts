import { prisma } from "./prisma";

export const defaultContent: Record<string, string> = {
  hero_title_1: "KLEBEN",
  hero_title_2: "GEGEN",
  hero_title_3: "RECHTS",
  hero_subtitle: "Kunst auf der Straße. Sticker als politisches Statement. Jedes Kleben ist ein Akt des Widerstands.",
  hero_badge: "Sticker Kunst & Widerstand",
  hero_btn_galerie: "Zur Galerie",
  hero_btn_shop: "Sticker Kaufen",
  marquee_text: "KLEBEN GEGEN RECHTS ✊ KUNST IST WIDERSTAND ✊ STICKER FÜR EINE BESSERE WELT ✊",
  shop_title: "Trag den Widerstand in die Stadt",
  shop_text: "Hochwertige Sticker direkt aus der Produktion. Jeder Kauf unterstützt die Kunst und den Aktivismus.",
  shop_badge: "Shop",
  footer_text: "Kunst ist Widerstand",
  galerie_title: "Die Galerie",
  galerie_subtitle: "Alle Werke auf einem Blick. Klick auf ein Bild für Details.",
  about_text: "",
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

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { copyFile, mkdir } from "fs/promises";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "..", "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: "file:" + dbPath });
const prisma = new PrismaClient({ adapter });

// Bilder aus dem Hauptordner
const sourceDir = join(__dirname, "..", "..", "");
const targetDir = join(__dirname, "..", "public", "uploads", "gallery");

await mkdir(targetDir, { recursive: true });

const images = [
  { src: "Adobe-Express-file-3.png", title: "Adobe Express Art", category: "allgemein" },
  { src: "IMG_00271-1536x1536.png", title: "Sticker Art 1", category: "street" },
  { src: "IMG_0036.png", title: "Sticker Art 2", category: "street" },
  { src: "resistcards002.png", title: "Resist Cards 1", category: "politik", featured: true },
  { src: "resistcards003.png", title: "Resist Cards 2", category: "politik", featured: true },
  { src: "startseite_resized.png", title: "Startseite Motiv", category: "allgemein", featured: true },
];

for (const img of images) {
  try {
    const filename = `imported-${img.src}`;
    await copyFile(join(sourceDir, img.src), join(targetDir, filename));

    const existing = await prisma.galleryImage.findFirst({
      where: { filename },
    });
    if (!existing) {
      await prisma.galleryImage.create({
        data: {
          title: img.title,
          filename,
          category: img.category,
          featured: img.featured ?? false,
        },
      });
      console.log("✅ Importiert:", img.title);
    } else {
      console.log("→ Bereits vorhanden:", img.title);
    }
  } catch (err) {
    console.error("❌ Fehler bei", img.src, ":", err.message);
  }
}

await prisma.$disconnect();
console.log("\nFertig! Alle Bilder importiert.\n");

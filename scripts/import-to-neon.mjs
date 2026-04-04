import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { v2 as cloudinary } from "cloudinary";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

cloudinary.config({
  cloud_name: "daiyyc9k3",
  api_key: "139829256344639",
  api_secret: "OxrQPQVdCysSE88B4MqTAju8fIw",
});

const DATABASE_URL = "postgresql://neondb_owner:npg_mHNF1Kc3vPrZ@ep-nameless-voice-alcvvyxt.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const galleryDir = join(__dirname, "..", "public", "uploads", "gallery");

const images = [
  { file: "imported-Adobe-Express-file-3.png", title: "Adobe Express Art", category: "allgemein", featured: false },
  { file: "imported-IMG_00271-1536x1536.png", title: "Sticker Art 1", category: "street", featured: false },
  { file: "imported-IMG_0036.png", title: "Sticker Art 2", category: "street", featured: false },
  { file: "imported-resistcards002.png", title: "Resist Cards 1", category: "politik", featured: true },
  { file: "imported-resistcards003.png", title: "Resist Cards 2", category: "politik", featured: true },
  { file: "imported-startseite_resized.png", title: "Startseite Motiv", category: "allgemein", featured: true },
];

for (const img of images) {
  const filePath = join(galleryDir, img.file);

  try {
    const buffer = await readFile(filePath);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "kgr/gallery" },
        (err, res) => { if (err) reject(err); else resolve(res); }
      ).end(buffer);
    });

    await prisma.galleryImage.create({
      data: {
        title: img.title,
        filename: result.secure_url,
        category: img.category,
        featured: img.featured,
      },
    });

    console.log("✅", img.title, "→", result.secure_url.slice(0, 60) + "...");
  } catch (err) {
    console.error("❌ Fehler bei", img.file, ":", err.message);
  }
}

await prisma.$disconnect();
console.log("\n✅ Alle Bilder in Neon + Cloudinary!\n");

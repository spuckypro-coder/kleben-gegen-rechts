import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { v2 as cloudinary } from "cloudinary";
import { readFile, access } from "fs/promises";
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

const images = await prisma.galleryImage.findMany();

for (const img of images) {
  if (img.filename.startsWith("http")) {
    console.log("→ Bereits Cloudinary:", img.title);
    continue;
  }

  const filePath = join(galleryDir, img.filename);

  try {
    await access(filePath);
    const buffer = await readFile(filePath);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "kgr/gallery", public_id: img.filename.replace(/\.[^.]+$/, "") },
        (err, res) => { if (err) reject(err); else resolve(res); }
      ).end(buffer);
    });

    await prisma.galleryImage.update({
      where: { id: img.id },
      data: { filename: result.secure_url },
    });

    console.log("✅ Hochgeladen:", img.title);
  } catch (err) {
    console.error("❌ Fehler:", img.filename, err.message);
  }
}

await prisma.$disconnect();
console.log("\nFertig!\n");

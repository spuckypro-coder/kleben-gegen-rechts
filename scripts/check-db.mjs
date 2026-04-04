import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: "postgresql://neondb_owner:npg_mHNF1Kc3vPrZ@ep-nameless-voice-alcvvyxt.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require" });
const prisma = new PrismaClient({ adapter });

const imgs = await prisma.galleryImage.findMany();
console.log("Bilder in DB:", imgs.length);
imgs.forEach(i => console.log(" -", i.title, "|", i.filename.slice(0, 80)));

await prisma.$disconnect();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const DATABASE_URL = "postgresql://neondb_owner:npg_mHNF1Kc3vPrZ@ep-nameless-voice-alcvvyxt.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const email = "admin@klebengegendrechts.de";
const password = "KlebenGegenwehr2024!";
const name = "Julia";

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) {
  console.log("Admin existiert bereits.");
  process.exit(0);
}

const hashed = await bcrypt.hash(password, 12);
await prisma.user.create({
  data: { email, password: hashed, name, role: "admin" },
});

console.log("\n✅ Admin-Account in Neon erstellt!");
console.log("   Email   :", email);
console.log("   Passwort:", password);

await prisma.$disconnect();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@klebengegendrechts.de";
  const password = "KlebenGegenwehr2024!";
  const name = "Julia";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin existiert bereits.");
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, password: hashed, name, role: "admin" },
  });

  console.log("✅ Admin erstellt!");
  console.log("Email:", email);
  console.log("Passwort:", password);
  console.log("→ Passwort nach dem ersten Login ändern!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

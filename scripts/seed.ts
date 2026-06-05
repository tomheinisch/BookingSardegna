import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sardinien.local" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@sardinien.local",
      password,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin-Benutzer erstellt:");
  console.log("   E-Mail:   admin@sardinien.local");
  console.log("   Passwort: admin123");
  console.log("   → Bitte nach dem ersten Login das Passwort ändern!");
  console.log("\nBenutzer-ID:", admin.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

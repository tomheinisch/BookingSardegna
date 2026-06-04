import { PrismaClient } from "../app/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbUrl = process.env.DATABASE_URL ?? `file:${path.resolve(process.cwd(), "dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
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

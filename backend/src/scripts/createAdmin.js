const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const prisma = require("../lib/prisma");
const { hashPassword } = require("../services/auth/passwordService");

async function createAdmin() {
  const email = String(process.env.AUTH_ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.AUTH_ADMIN_PASSWORD;
  const displayName = String(process.env.AUTH_ADMIN_DISPLAY_NAME || "Administrateur").trim();

  if (!email || !password) {
    throw new Error("AUTH_ADMIN_EMAIL et AUTH_ADMIN_PASSWORD sont obligatoires.");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new Error("Un utilisateur existe déjà avec cet email.");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, displayName, role: "ADMIN" },
    select: { id: true, email: true, displayName: true, role: true },
  });

  console.log(`Administrateur créé: ${user.email} (${user.id})`);
}

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
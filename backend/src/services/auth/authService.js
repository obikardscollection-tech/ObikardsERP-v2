const prisma = require("../../lib/prisma");
const { verifyPassword } = require("./passwordService");
const { createSession } = require("./sessionService");

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}

function invalidCredentialsError() {
  const error = new Error("Identifiants invalides.");
  error.statusCode = 401;
  return error;
}

async function login(email, password) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = normalizedEmail
    ? await prisma.user.findUnique({ where: { email: normalizedEmail } })
    : null;

  if (!user || !user.isActive || !await verifyPassword(user.passwordHash, password)) {
    throw invalidCredentialsError();
  }

  const session = await createSession(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return { user: publicUser(user), ...session };
}

module.exports = {
  login,
  publicUser,
};
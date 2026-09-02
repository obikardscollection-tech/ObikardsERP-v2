const crypto = require("node:crypto");
const prisma = require("../../lib/prisma");
const { sessionTtlMs } = require("../../config/authConfig");

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionTtlMs);

  await prisma.authSession.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  return { token, expiresAt };
}

async function getSession(token) {
  if (!token) return null;

  const session = await prisma.authSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt <= new Date() || !session.user.isActive) {
    await prisma.authSession.deleteMany({ where: { id: session.id } });
    return null;
  }

  return session;
}

async function revokeSession(token) {
  if (!token) return;
  await prisma.authSession.deleteMany({ where: { tokenHash: hashToken(token) } });
}

module.exports = {
  createSession,
  getSession,
  hashToken,
  revokeSession,
};
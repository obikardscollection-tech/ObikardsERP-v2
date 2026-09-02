const argon2 = require("argon2");

async function hashPassword(password) {
  if (typeof password !== "string" || password.length < 12) {
    throw new Error("Le mot de passe doit contenir au moins 12 caractères.");
  }

  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

async function verifyPassword(hash, password) {
  if (!hash || typeof password !== "string") {
    return false;
  }

  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
};
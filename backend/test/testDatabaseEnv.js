const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

function isExplicitTestDatabase(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    const databaseName = url.pathname.replace(/^\//, "");
    const schemaName = url.searchParams.get("schema") || "";
    return /(^|[_-])test([_-]|$)/i.test(databaseName)
      || /(^|[_-])test([_-]|$)/i.test(schemaName);
  } catch {
    return false;
  }
}

function configureTestDatabase() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;
  const testDirectUrl = process.env.TEST_DIRECT_URL || testDatabaseUrl;

  if (!testDatabaseUrl) {
    throw new Error("TEST_DATABASE_URL est obligatoire pour lancer la regression.");
  }
  if (!isExplicitTestDatabase(testDatabaseUrl) || !isExplicitTestDatabase(testDirectUrl)) {
    throw new Error("Les URLs de test doivent cibler une base ou un schema explicitement marque test.");
  }
  if (process.env.OBIKARDS_TEST_ENV_CONFIGURED === "true") {
    if (process.env.DATABASE_URL !== testDatabaseUrl || process.env.DIRECT_URL !== testDirectUrl) {
      throw new Error("Les URLs Prisma ont change apres la validation de l'environnement de test.");
    }
    return;
  }
  if (testDatabaseUrl === process.env.DATABASE_URL) {
    throw new Error("TEST_DATABASE_URL doit etre distincte de DATABASE_URL.");
  }

  process.env.NODE_ENV = "test";
  process.env.AUTH_COOKIE_SECURE = "false";
  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.DIRECT_URL = testDirectUrl;
  process.env.OBIKARDS_TEST_ENV_CONFIGURED = "true";
}

module.exports = { configureTestDatabase, isExplicitTestDatabase };
const { spawnSync } = require("node:child_process");
const { configureTestDatabase } = require("./testDatabaseEnv");

configureTestDatabase();

const prismaCli = require.resolve("prisma/build/index.js");
const result = spawnSync(process.execPath, [prismaCli, "migrate", "deploy"], {
  cwd: require("node:path").resolve(__dirname, ".."),
  env: process.env,
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
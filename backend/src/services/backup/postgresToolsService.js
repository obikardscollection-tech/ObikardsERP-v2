const { spawn } = require("node:child_process");
const {
  pgDumpPath,
  pgRestorePath,
  psqlPath,
} = require("../../config/backupConfig");
const { backupError } = require("./backupErrors");

const TOOL_PATHS = {
  pg_dump: pgDumpPath,
  pg_restore: pgRestorePath,
  psql: psqlPath,
};

function parsePostgresUrl(databaseUrl) {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw backupError("DIRECT_URL PostgreSQL est invalide.", {
      code: "INVALID_DATABASE_URL",
      statusCode: 500,
    });
  }

  if (!["postgresql:", "postgres:"].includes(url.protocol)) {
    throw backupError("DIRECT_URL doit utiliser PostgreSQL.", {
      code: "INVALID_DATABASE_URL",
      statusCode: 500,
    });
  }

  return {
    database: decodeURIComponent(url.pathname.slice(1)),
    env: {
      PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
      PGHOST: url.hostname,
      PGPASSWORD: decodeURIComponent(url.password),
      PGPORT: url.port || "5432",
      PGUSER: decodeURIComponent(url.username),
      ...(url.searchParams.get("sslmode") ? { PGSSLMODE: url.searchParams.get("sslmode") } : {}),
    },
  };
}

function runTool(tool, args, options = {}) {
  const executable = TOOL_PATHS[tool];
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.databaseEnv },
      shell: false,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => { stdout = `${stdout}${chunk}`.slice(-16000); });
    child.stderr?.on("data", (chunk) => { stderr = `${stderr}${chunk}`.slice(-16000); });
    child.on("error", (error) => {
      reject(backupError(`Outil PostgreSQL indisponible: ${tool}.`, {
        code: "POSTGRES_TOOL_UNAVAILABLE",
        statusCode: 503,
        details: { tool, reason: error.code || error.message },
      }));
    });
    child.on("close", (exitCode) => {
      if (exitCode === 0) return resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      return reject(backupError(`${tool} a echoue.`, {
        code: "POSTGRES_TOOL_FAILED",
        statusCode: 500,
        details: { tool, exitCode, stderr: stderr.trim() },
      }));
    });
  });
}

function parseMajorVersion(output) {
  const match = String(output).match(/(\d+)(?:\.\d+)?/);
  return match ? Number(match[1]) : null;
}

async function inspectPostgresTools(databaseUrl = process.env.DIRECT_URL) {
  const connection = parsePostgresUrl(databaseUrl);
  const [dump, restore, psql, server] = await Promise.all([
    runTool("pg_dump", ["--version"]),
    runTool("pg_restore", ["--version"]),
    runTool("psql", ["--version"]),
    runTool("psql", ["--no-align", "--tuples-only", "--command", "SHOW server_version"], { databaseEnv: connection.env }),
  ]);
  const versions = {
    pgDump: dump.stdout,
    pgDumpMajor: parseMajorVersion(dump.stdout),
    pgRestore: restore.stdout,
    pgRestoreMajor: parseMajorVersion(restore.stdout),
    psql: psql.stdout,
    server: server.stdout,
    serverMajor: parseMajorVersion(server.stdout),
  };

  if (!versions.pgDumpMajor || !versions.pgRestoreMajor || !versions.serverMajor
    || versions.pgDumpMajor < versions.serverMajor || versions.pgRestoreMajor < versions.serverMajor) {
    throw backupError("La version des clients PostgreSQL est incompatible avec le serveur.", {
      code: "POSTGRES_VERSION_INCOMPATIBLE",
      statusCode: 503,
      details: versions,
    });
  }
  return versions;
}

async function createDatabaseDump(outputPath, databaseUrl = process.env.DIRECT_URL) {
  const connection = parsePostgresUrl(databaseUrl);
  await runTool("pg_dump", [
    "--format=custom",
    "--no-owner",
    "--no-privileges",
    "--file", outputPath,
  ], { databaseEnv: connection.env });
}

async function restoreDatabaseDump(dumpPath, databaseUrl) {
  const connection = parsePostgresUrl(databaseUrl);
  await runTool("pg_restore", [
    "--clean",
    "--if-exists",
    "--no-owner",
    "--no-privileges",
    "--exit-on-error",
    "--dbname", connection.database,
    dumpPath,
  ], { databaseEnv: connection.env });
}

async function validateDatabaseDump(dumpPath) {
  await runTool("pg_restore", ["--list", dumpPath]);
}

module.exports = {
  createDatabaseDump,
  inspectPostgresTools,
  parseMajorVersion,
  parsePostgresUrl,
  restoreDatabaseDump,
  runTool,
  validateDatabaseDump,
};
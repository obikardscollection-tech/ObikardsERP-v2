process.env.PG_DUMP_PATH = `missing-pg-dump-${process.pid}`;

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { parsePostgresUrl, runTool } = require("../src/services/backup/postgresToolsService");

test("PostgreSQL credentials are mapped to environment variables", () => {
  const connection = parsePostgresUrl("postgresql://user:p%40ss@db.example:5433/erp?sslmode=require");
  assert.equal(connection.database, "erp");
  assert.deepEqual(connection.env, {
    PGDATABASE: "erp",
    PGHOST: "db.example",
    PGPASSWORD: "p@ss",
    PGPORT: "5433",
    PGSSLMODE: "require",
    PGUSER: "user",
  });
});

test("missing PostgreSQL tool returns an explicit service error", async () => {
  await assert.rejects(runTool("pg_dump", ["--version"]), {
    code: "POSTGRES_TOOL_UNAVAILABLE",
    statusCode: 503,
  });
});
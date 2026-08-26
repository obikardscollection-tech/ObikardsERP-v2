require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_URL missing');
}

(async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const beforeCountRes = await client.query('SELECT COUNT(*)::int AS count FROM "Inventory";');
    const beforeCount = Number(beforeCountRes.rows[0].count);

    const existsRes = await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Inventory' AND column_name = 'subset') AS exists;");
    const hasSubsetBefore = !!existsRes.rows[0].exists;

    console.log(JSON.stringify({ beforeCount, hasSubsetBefore }, null, 2));

    if (!hasSubsetBefore) {
      await client.query('ALTER TABLE "Inventory" ADD COLUMN IF NOT EXISTS "subset" TEXT;');
      console.log('ALTER_TABLE_OK');
    } else {
      console.log('ALTER_TABLE_SKIPPED_ALREADY_EXISTS');
    }

    const afterExistsRes = await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Inventory' AND column_name = 'subset') AS exists;");
    const afterCountRes = await client.query('SELECT COUNT(*)::int AS count FROM "Inventory";');
    const afterCount = Number(afterCountRes.rows[0].count);
    const hasSubsetAfter = !!afterExistsRes.rows[0].exists;

    console.log(JSON.stringify({ hasSubsetAfter, afterCount, unchangedCount: beforeCount === afterCount }, null, 2));

    const sampleRowRes = await client.query('SELECT id, sku, "subset" FROM "Inventory" ORDER BY "updatedAt" DESC NULLS LAST LIMIT 1;');
    const sampleRow = sampleRowRes.rows[0] || null;
    console.log(JSON.stringify({ sampleRow }, null, 2));

    let testRow = sampleRow;
    if (testRow && testRow.id) {
      const updated = await client.query(
        'UPDATE "Inventory" SET "subset" = $1 WHERE id = $2 RETURNING id, sku, "subset";',
        ['Punched Ticket', testRow.id]
      );
      console.log(JSON.stringify({ singleCardSubsetWrite: updated.rows[0] || null }, null, 2));
      const verify = await client.query('SELECT id, sku, "subset" FROM "Inventory" WHERE id = $1;', [testRow.id]);
      console.log(JSON.stringify({ singleCardSubsetVerify: verify.rows[0] || null }, null, 2));
    } else {
      console.log('NO_ROW_AVAILABLE_FOR_SINGLE_CARD_TEST');
    }

    const nullableCheck = await client.query('SELECT id, sku, "subset" FROM "Inventory" WHERE "subset" IS NULL ORDER BY "updatedAt" DESC NULLS LAST LIMIT 3;');
    console.log(JSON.stringify({ nullableSample: nullableCheck.rows }, null, 2));

    const schemaCheck = await client.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Inventory' AND column_name = 'subset';");
    console.log(JSON.stringify({ schemaCheck: schemaCheck.rows }, null, 2));
  } catch (error) {
    console.error('DB_SCRIPT_ERROR');
    console.error(error && error.stack ? error.stack : String(error));
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();

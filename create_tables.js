const { PGlite } = require("@electric-sql/pglite");

async function main() {
  const db = new PGlite("./packages/backend/pglite-db");
  await db.waitReady;

  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS public;
    CREATE TABLE IF NOT EXISTS public."EntityConfig" (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      "apiUrl" TEXT NOT NULL,
      "apiType" TEXT DEFAULT 'REST' NOT NULL,
      fields TEXT NOT NULL
    );
  `);

  console.log("PGlite tables created in correct db");
  process.exit(0);
}
main();

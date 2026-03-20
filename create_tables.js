const { PGlite } = require("@electric-sql/pglite");

async function main() {
  const db = new PGlite("./packages/backend/pglite-db");
  await db.waitReady;

  await db.exec(`
    CREATE SCHEMA IF NOT EXISTS public;

    CREATE TABLE IF NOT EXISTS public."DataSource" (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      "apiUrl" TEXT NOT NULL,
      "apiType" TEXT DEFAULT 'REST' NOT NULL,
      headers TEXT,
      "endpointsQueries" TEXT
    );

    CREATE TABLE IF NOT EXISTS public."EntityConfig" (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      "dataSourceId" INTEGER NOT NULL REFERENCES public."DataSource"(id),
      "gridTemplate" TEXT
    );

    CREATE TABLE IF NOT EXISTS public."Field" (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      label TEXT NOT NULL,
      "entityConfigId" INTEGER NOT NULL REFERENCES public."EntityConfig"(id) ON DELETE CASCADE,
      UNIQUE("entityConfigId", name)
    );
  `);

  console.log("PGlite tables created in correct db");
  process.exit(0);
}
main();

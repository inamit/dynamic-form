const { PGlite } = require("@electric-sql/pglite");

async function main() {
  const db = new PGlite("./pglite-db");
  await db.waitReady;

  // Create tables mimicking what prisma migrate would do
  await db.exec(`
    CREATE TABLE IF NOT EXISTS "EntityConfig" (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      "apiUrl" TEXT NOT NULL,
      "apiType" TEXT DEFAULT 'REST' NOT NULL,
      fields TEXT NOT NULL
    );
  `);

  console.log("PGlite database initialized and ready at ./pglite-db");
}
main();

import { PGlite } from '@electric-sql/pglite';

async function main() {
  const db = new PGlite('./packages/backend/pglite-db');
  await db.query(`
    CREATE TABLE IF NOT EXISTS test (
      id SERIAL PRIMARY KEY,
      name TEXT
    );
  `);
  console.log('table created');
}

main().catch(console.error);

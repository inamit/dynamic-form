import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';

async function main() {
  const db = new PGlite('./pglite-db');

  console.log('Creating tables in PGlite...');
  await db.exec(`
    CREATE TABLE IF NOT EXISTS "SitePermission" (
      "id" SERIAL PRIMARY KEY,
      "origin" TEXT NOT NULL,
      "entityName" TEXT NOT NULL,
      "ability" TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "UserPermission" (
      "id" SERIAL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "entityName" TEXT NOT NULL,
      "ability" TEXT NOT NULL,
      "geography" TEXT,
      "fieldValue" TEXT
    );
  `);

  console.log('Tables created successfully.');

  await db.exec(`
    INSERT INTO "SitePermission" ("origin", "entityName", "ability") VALUES
    ('http://localhost:5001', 'country', 'view'),
    ('http://localhost:5001', 'country', 'create'),
    ('http://localhost:5001', 'country', 'edit'),
    ('http://localhost:5001', 'country', 'delete'),
    ('http://localhost:5002', 'country', 'view'),
    ('http://localhost:5002', 'country', 'create'),
    ('http://localhost:5002', 'country', 'edit'),
    ('http://localhost:5002', 'country', 'delete');
  `);

  console.log('Mock site permissions seeded.');
}

main().catch(console.error);
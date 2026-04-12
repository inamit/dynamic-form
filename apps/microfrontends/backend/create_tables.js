import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PGlite } from '@electric-sql/pglite';

const client = new PGlite('./pglite-db');
const adapter = new PrismaPGlite(client);
const prisma = new PrismaClient({ adapter });

async function main() {
    await client.exec(`
CREATE TABLE IF NOT EXISTS "DataSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiUrl" TEXT NOT NULL,
    "apiType" TEXT NOT NULL DEFAULT 'REST',
    "headers" TEXT,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DataSource_name_key" ON "DataSource"("name");

CREATE TABLE IF NOT EXISTS "EntityConfig" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dataSourceId" INTEGER NOT NULL,
    "defaultPresetId" INTEGER,
    "schemaName" TEXT,
    "endpointsQueries" TEXT,
    "auth" TEXT,

    CONSTRAINT "EntityConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EntityConfig_name_key" ON "EntityConfig"("name");

ALTER TABLE "EntityConfig" ADD CONSTRAINT "EntityConfig_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "DataSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "Preset" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gridTemplate" TEXT NOT NULL,
    "defaultValues" TEXT,
    "entityConfigId" INTEGER NOT NULL,

    CONSTRAINT "Preset_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Preset" ADD COLUMN IF NOT EXISTS "defaultValues" TEXT;

ALTER TABLE "Preset" ADD CONSTRAINT "Preset_entityConfigId_fkey" FOREIGN KEY ("entityConfigId") REFERENCES "EntityConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "Field" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "enumName" TEXT,
    "entityConfigId" INTEGER NOT NULL,

    CONSTRAINT "Field_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Field_entityConfigId_name_key" ON "Field"("entityConfigId", "name");

ALTER TABLE "Field" ADD CONSTRAINT "Field_entityConfigId_fkey" FOREIGN KEY ("entityConfigId") REFERENCES "EntityConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    console.log("Tables created successfully");
}

main().catch(console.error);

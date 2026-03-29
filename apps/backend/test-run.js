import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PGlite } from '@electric-sql/pglite';

const client = new PGlite('./pglite-db');
const adapter = new PrismaPGlite(client);
const prisma = new PrismaClient({ adapter });

async function main() {
  const configs = await prisma.entityConfig.findMany();
  console.log(configs);
}

main().catch(console.error);

import { PrismaClient } from '@prisma/client';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PGlite } from '@electric-sql/pglite';

const client = new PGlite('./pglite-db');
const adapter = new PrismaPGlite(client);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.entityConfig.upsert({
    where: { name: 'person' },
    update: {},
    create: {
      name: 'person',
      apiUrl: 'http://localhost:4000/api/persons',
      apiType: 'REST',
      fields: JSON.stringify([
        { name: 'firstName', type: 'text', label: 'First Name' },
        { name: 'age', type: 'number', label: 'Age' },
        { name: 'isActive', type: 'checkbox', label: 'Active' },
      ]),
    },
  });

  await prisma.entityConfig.upsert({
    where: { name: 'candy' },
    update: {},
    create: {
      name: 'candy',
      apiUrl: 'http://localhost:4000/api/candies',
      apiType: 'REST',
      fields: JSON.stringify([
        { name: 'name', type: 'text', label: 'Candy Name' },
        { name: 'price', type: 'number', label: 'Price ($)' },
        { name: 'isVegan', type: 'checkbox', label: 'Is Vegan?' },
      ]),
    },
  });

  await prisma.entityConfig.upsert({
    where: { name: 'store' },
    update: {},
    create: {
      name: 'store',
      apiUrl: 'http://localhost:4000/graphql',
      apiType: 'GRAPHQL',
      fields: JSON.stringify([
        { name: 'name', type: 'text', label: 'Store Name' },
        { name: 'rating', type: 'number', label: 'Rating' },
        { name: 'isOpen', type: 'checkbox', label: 'Is Open?' },
      ]),
    },
  });

  console.log('Database seeded with configurations!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

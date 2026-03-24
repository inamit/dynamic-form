import pkg from '@prisma/client';

const {PrismaClient} = pkg;
import {PrismaPGlite} from 'pglite-prisma-adapter';
import {PGlite} from '@electric-sql/pglite';
import {PrismaPg} from "@prisma/adapter-pg";

let prisma: any;

if (process.env.NODE_ENV === 'production' || process.env.USE_REAL_POSTGRES === 'true') {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
    });
    prisma = new PrismaClient({adapter});
} else {
    const client = new PGlite('./pglite-db');
    const adapter = new PrismaPGlite(client);
    prisma = new PrismaClient({adapter});
}

async function main() {
    // REST DataSource for Persons
    const personDs = await prisma.dataSource.upsert({
        where: {name: 'person-api'},
        update: {},
        create: {
            name: 'person-api',
            apiUrl: 'http://localhost:4000/api/persons',
            apiType: 'REST'
        }
    });

    await prisma.entityConfig.upsert({
        where: {name: 'person'},
        update: {},
        create: {
            name: 'person',
            dataSourceId: personDs.id,
            fields: {
                create: [
                    {name: 'firstName', type: 'text', label: 'First Name'},
                    {name: 'lastName', type: 'text', label: 'Last Name'},
                    {name: 'isActive', type: 'checkbox', label: 'Active'},
                    {name: 'status', type: 'enum', label: 'Status', enumName: 'person-status'},
                ]
            }
        },
    });

    // Enum DataSource
    await prisma.dataSource.upsert({
        where: {name: 'enum'},
        update: {},
        create: {
            name: 'enum',
            apiUrl: 'http://localhost:4000/api/enums',
            apiType: 'REST'
        }
    });

    // REST DataSource for Candies
    const candyDs = await prisma.dataSource.upsert({
        where: {name: 'candy-api'},
        update: {},
        create: {
            name: 'candy-api',
            apiUrl: 'http://localhost:4000/api/candies',
            apiType: 'REST'
        }
    });

    await prisma.entityConfig.upsert({
        where: {name: 'candy'},
        update: {},
        create: {
            name: 'candy',
            dataSourceId: candyDs.id,
            fields: {
                create: [
                    {name: 'name', type: 'text', label: 'Candy Name'},
                    {name: 'price', type: 'number', label: 'Price ($)'},
                    {name: 'isVegan', type: 'checkbox', label: 'Is Vegan?'},
                ]
            }
        },
    });

    // GraphQL DataSource for Stores
    const storeQueries = {
        list: `
      query {
        stores {
          id
          name
          rating
          isOpen
        }
      }
    `,
        get: `
      query GetStore($id: ID!) {
        store(id: $id) {
          id
          name
          rating
          isOpen
        }
      }
    `,
        create: `
      mutation CreateStore($name: String!, $rating: Float!, $isOpen: Boolean!) {
        createStore(name: $name, rating: $rating, isOpen: $isOpen) {
          id
          name
          rating
          isOpen
        }
      }
    `,
        update: `
      mutation UpdateStore($id: ID!, $name: String, $rating: Float, $isOpen: Boolean) {
        updateStore(id: $id, name: $name, rating: $rating, isOpen: $isOpen) {
          id
          name
          rating
          isOpen
        }
      }
    `,
        delete: `
      mutation DeleteStore($id: ID!) {
        deleteStore(id: $id)
      }
    `
    };

    const storeDs = await prisma.dataSource.upsert({
        where: {name: 'store-graphql'},
        update: {},
        create: {
            name: 'store-graphql',
            apiUrl: 'http://localhost:4000/graphql',
            apiType: 'GRAPHQL',
            endpointsQueries: JSON.stringify(storeQueries)
        }
    });

    await prisma.entityConfig.upsert({
        where: {name: 'store'},
        update: {},
        create: {
            name: 'store',
            dataSourceId: storeDs.id,
            fields: {
                create: [
                    {name: 'name', type: 'text', label: 'Store Name'},
                    {name: 'rating', type: 'number', label: 'Rating'},
                    {name: 'isOpen', type: 'checkbox', label: 'Is Open?'},
                ]
            }
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

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

    const personConfig = await prisma.entityConfig.upsert({
        where: {name: 'person'},
        update: {},
        create: {
            name: 'person',
            dataSourceId: personDs.id,
            endpointsQueries: JSON.stringify({"list":{"endpoint":"/persons","method":"GET"},"get":{"endpoint":"/persons/:id","method":"GET"},"create":{"endpoint":"/persons","method":"POST"},"update":{"endpoint":"/persons/:id","method":"PUT"},"delete":{"endpoint":"/persons/:id","method":"DELETE"}}),
            fields: {
                create: [
                    {name: 'firstName', type: 'text', label: 'First Name'},
                    {name: 'lastName', type: 'text', label: 'Last Name'},
                    {name: 'isActive', type: 'checkbox', label: 'Active'},
                    {name: 'status', type: 'enum', label: 'Status', enumName: 'person-status'},
                ]
            },
            presets: {
                create: [
                    { name: 'Default', gridTemplate: '"firstName lastName" "status isActive"' }
                ]
            }
        },
        include: { presets: true }
    });

    if (personConfig.presets && personConfig.presets.length > 0) {
        await prisma.entityConfig.update({
            where: { id: personConfig.id },
            data: { defaultPresetId: personConfig.presets[0].id }
        });
    }

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

    const candyConfig = await prisma.entityConfig.upsert({
        where: {name: 'candy'},
        update: {},
        create: {
            name: 'candy',
            dataSourceId: candyDs.id,
            endpointsQueries: JSON.stringify({"list":{"endpoint":"/candies","method":"GET"},"get":{"endpoint":"/candies/:id","method":"GET"},"create":{"endpoint":"/candies","method":"POST"},"update":{"endpoint":"/candies/:id","method":"PUT"},"delete":{"endpoint":"/candies/:id","method":"DELETE"}}),
            fields: {
                create: [
                    {name: 'name', type: 'text', label: 'Candy Name'},
                    {name: 'price', type: 'number', label: 'Price ($)'},
                    {name: 'isVegan', type: 'checkbox', label: 'Is Vegan?'},
                ]
            },
            presets: {
                create: [
                    { name: 'Default', gridTemplate: '"name price isVegan"' }
                ]
            }
        },
        include: { presets: true }
    });

    if (candyConfig.presets && candyConfig.presets.length > 0) {
        await prisma.entityConfig.update({
            where: { id: candyConfig.id },
            data: { defaultPresetId: candyConfig.presets[0].id }
        });
    }

    // GraphQL DataSource for Stores
    const storeQueries = {
        list: `
      query {
        stores {
          id
          name
          rating
          isOpen
          location {
            latitude
            longitude
          }
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
          location {
            latitude
            longitude
          }
        }
      }
    `,
        create: `
      mutation CreateStore($name: String!, $rating: Float!, $isOpen: Boolean!, $location: LocationInput) {
        createStore(name: $name, rating: $rating, isOpen: $isOpen, location: $location) {
          id
          name
          rating
          isOpen
          location {
            latitude
            longitude
          }
        }
      }
    `,
        update: `
      mutation UpdateStore($id: ID!, $name: String, $rating: Float, $isOpen: Boolean, $location: LocationInput) {
        updateStore(id: $id, name: $name, rating: $rating, isOpen: $isOpen, location: $location) {
          id
          name
          rating
          isOpen
          location {
            latitude
            longitude
          }
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
            }
    });

    const storeConfig = await prisma.entityConfig.upsert({
        where: {name: 'store'},
        update: {
            fields: {
                deleteMany: {},
                create: [
                    {name: 'name', type: 'text', label: 'Store Name'},
                    {name: 'rating', type: 'number', label: 'Rating'},
                    {name: 'isOpen', type: 'checkbox', label: 'Is Open?'},
                    {name: 'location', type: 'coordinate', label: 'Location'},
                ]
            }
        },
        create: {
            name: 'store',
            dataSourceId: storeDs.id,
            endpointsQueries: JSON.stringify(storeQueries),
            fields: {
                create: [
                    {name: 'name', type: 'text', label: 'Store Name'},
                    {name: 'rating', type: 'number', label: 'Rating'},
                    {name: 'isOpen', type: 'checkbox', label: 'Is Open?'},
                    {name: 'location', type: 'coordinate', label: 'Location'},
                ]
            },
            presets: {
                create: [
                    { name: 'Default', gridTemplate: '"name rating" "isOpen location"' }
                ]
            }
        },
        include: { presets: true }
    });

    if (storeConfig.presets && storeConfig.presets.length > 0) {
        await prisma.entityConfig.update({
            where: { id: storeConfig.id },
            data: { defaultPresetId: storeConfig.presets[0].id }
        });
    }

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

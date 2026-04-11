import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPGlite } from 'pglite-prisma-adapter';
import { PGlite } from '@electric-sql/pglite';
import { PrismaPg } from "@prisma/adapter-pg";

let prisma: any;

export function getPrisma() {
    if (prisma) return prisma;

    if (process.env.NODE_ENV === 'production' || process.env.USE_REAL_POSTGRES === 'true') {
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL!,
        });
        prisma = new PrismaClient({ adapter });
    } else {
        const client = new PGlite('./pglite-db');
        const adapter = new PrismaPGlite(client);
        prisma = new PrismaClient({ adapter });
    }
    return prisma;
}

export function setPrismaClient(client: any) {
    prisma = client;
}

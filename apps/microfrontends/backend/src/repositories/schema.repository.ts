import { getPrisma } from '../db/prisma.js';

export class SchemaRepository {
    async getEnumDataSource() {
        const prisma = getPrisma();
        return await prisma.dataSource.findUnique({
            where: { name: 'enum' }
        });
    }
}

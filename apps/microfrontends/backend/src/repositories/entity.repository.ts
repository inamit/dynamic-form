import { getPrisma } from '../db/prisma.js';

export class EntityRepository {
    async findEntityConfig(entityName: string) {
        const prisma = getPrisma();
        return await prisma.entityConfig.findUnique({
            where: { name: entityName },
            include: { dataSource: true, fields: true }
        });
    }
}

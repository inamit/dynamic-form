import { getPrisma } from '../db/prisma.js';

export class ConfigRepository {
    async findAllConfigs() {
        const prisma = getPrisma();
        return await prisma.entityConfig.findMany({
            include: { dataSource: true, fields: true }
        });
    }

    async findConfigByName(name: string) {
        const prisma = getPrisma();
        return await prisma.entityConfig.findUnique({
            where: { name },
            include: { dataSource: true, fields: true, presets: true }
        });
    }
}

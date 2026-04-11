import { getPrisma } from '../db/prisma.js';

export class DataSourceRepository {
    async getDataSources() {
        const prisma = getPrisma();
        return await prisma.dataSource.findMany();
    }

    async createDataSource(data: any) {
        const prisma = getPrisma();
        return await prisma.dataSource.create({ data });
    }

    async updateDataSource(id: number, data: any) {
        const prisma = getPrisma();
        return await prisma.dataSource.update({ where: { id }, data });
    }

    async deleteDataSource(id: number) {
        const prisma = getPrisma();
        return await prisma.dataSource.delete({ where: { id } });
    }
}

import { getPrisma } from '../db/prisma.js';

export class EntityConfigRepository {
    async getConfigById(id: number) {
        const prisma = getPrisma();
        return await prisma.entityConfig.findUnique({
            where: { id },
            include: { dataSource: true, fields: true, presets: true }
        });
    }

    async createConfig(data: any) {
        const prisma = getPrisma();
        return await prisma.entityConfig.create({
            data,
            include: { fields: true, presets: true }
        });
    }

    async updateConfigWithTransaction(id: number, data: any, oldDefaultPresetId: number | null, presetsInput: any[]) {
        const prisma = getPrisma();

        return await prisma.$transaction(async (tx: any) => {
            await tx.field.deleteMany({ where: { entityConfigId: id } });
            await tx.preset.deleteMany({ where: { entityConfigId: id } });

            const config = await tx.entityConfig.update({
                where: { id },
                data,
                include: { fields: true, presets: true }
            });

            let newDefaultPresetId = null;
            if (oldDefaultPresetId) {
                const selectedPresetName = presetsInput.find((p: any) => p.id === oldDefaultPresetId)?.name;
                if (selectedPresetName) {
                    newDefaultPresetId = config.presets.find((p: any) => p.name === selectedPresetName)?.id;
                }
            }
            if (!newDefaultPresetId && config.presets.length > 0) {
                 newDefaultPresetId = config.presets[0].id;
            }

            const finalConfig = await tx.entityConfig.update({
                where: { id },
                data: { defaultPresetId: newDefaultPresetId },
                include: { fields: true, presets: true }
            });

            return finalConfig;
        });
    }

    async updateConfigDefaultPresetId(id: number, defaultPresetId: number | null) {
        const prisma = getPrisma();
        return await prisma.entityConfig.update({
            where: { id },
            data: { defaultPresetId },
            include: { fields: true, presets: true }
        });
    }

    async deleteConfig(id: number) {
        const prisma = getPrisma();
        return await prisma.entityConfig.delete({ where: { id } });
    }
}

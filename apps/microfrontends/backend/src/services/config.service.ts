import { ConfigRepository } from '../repositories/config.repository.js';

export class ConfigService {
    private configRepository: ConfigRepository;

    constructor() {
        this.configRepository = new ConfigRepository();
    }

    async getAllConfigs() {
        const configs = await this.configRepository.findAllConfigs();
        return configs.map((c: any) => ({
            ...c,
            apiUrl: c.dataSource.apiUrl,
            apiType: c.dataSource.apiType
        }));
    }

    async getConfigByName(name: string) {
        return await this.configRepository.findConfigByName(name);
    }
}

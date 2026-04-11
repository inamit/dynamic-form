import { DataSourceRepository } from '../repositories/data-source.repository.js';
import { validateUrl } from '../utils.js';

export class DataSourceService {
    private dataSourceRepo: DataSourceRepository;

    constructor() {
        this.dataSourceRepo = new DataSourceRepository();
    }

    async getDataSources() {
        return await this.dataSourceRepo.getDataSources();
    }

    async createDataSource(data: any) {
        if (data.apiUrl) {
            data.apiUrl = validateUrl(data.apiUrl);
        }
        return await this.dataSourceRepo.createDataSource(data);
    }

    async updateDataSource(id: number, data: any) {
        if (data.apiUrl) {
            data.apiUrl = validateUrl(data.apiUrl);
        }
        return await this.dataSourceRepo.updateDataSource(id, data);
    }

    async deleteDataSource(id: number) {
        return await this.dataSourceRepo.deleteDataSource(id);
    }
}

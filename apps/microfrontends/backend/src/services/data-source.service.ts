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
        const { name, apiUrl, apiType, headers, endpointsQueries } = data;
        const safeData = { name, apiUrl, apiType, headers, endpointsQueries };
        if (safeData.apiUrl) {
            safeData.apiUrl = validateUrl(safeData.apiUrl);
        }
        return await this.dataSourceRepo.createDataSource(safeData);
    }

    async updateDataSource(id: number, data: any) {
        const { name, apiUrl, apiType, headers, endpointsQueries } = data;
        const safeData = { name, apiUrl, apiType, headers, endpointsQueries };

        // Remove undefined fields so they aren't overwritten with null/undefined
        const filteredData: any = {};
        for (const key in safeData) {
            if ((safeData as any)[key] !== undefined) {
                filteredData[key] = (safeData as any)[key];
            }
        }

        if (filteredData.apiUrl) {
            filteredData.apiUrl = validateUrl(filteredData.apiUrl);
        }
        return await this.dataSourceRepo.updateDataSource(id, filteredData);
    }

    async deleteDataSource(id: number) {
        return await this.dataSourceRepo.deleteDataSource(id);
    }
}

import { SchemaRepository } from '../repositories/schema.repository.js';
import { SchemaClient } from '../clients/schema.client.js';

export class SchemaService {
    private schemaRepository: SchemaRepository;
    private schemaClient: SchemaClient;

    constructor() {
        this.schemaRepository = new SchemaRepository();
        this.schemaClient = new SchemaClient();
    }

    async getSchemas() {
        const ds = await this.schemaRepository.getEnumDataSource();
        if (!ds) throw new Error('Data source not found');
        const headers = ds.headers ? JSON.parse(ds.headers) : {};
        return await this.schemaClient.fetchSchemas(ds.apiUrl, headers);
    }

    async getSchema(entityName: string) {
        const ds = await this.schemaRepository.getEnumDataSource();
        if (!ds) throw new Error('Data source not found');
        const headers = ds.headers ? JSON.parse(ds.headers) : {};
        return await this.schemaClient.fetchSchema(ds.apiUrl, headers, entityName);
    }

    async getEnum(enumName: string) {
        const ds = await this.schemaRepository.getEnumDataSource();
        if (!ds) throw new Error('Data source not found');
        const headers = ds.headers ? JSON.parse(ds.headers) : {};
        return await this.schemaClient.fetchEnum(ds.apiUrl, headers, enumName);
    }
}

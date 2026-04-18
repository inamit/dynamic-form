import { SchemaClient } from '../clients/schema.client.js';

export class SchemaService {
    private schemaClient: SchemaClient;

    constructor() {
        this.schemaClient = new SchemaClient();
    }

    async getSchemas() {
        const schemaApiUrl = process.env.SCHEMA_API_URL || 'http://localhost:4000/api/schemas';
        if (!schemaApiUrl) throw new Error('Schema configuration not found');

        const headers = process.env.SCHEMA_API_HEADERS ? JSON.parse(process.env.SCHEMA_API_HEADERS) : {};
        return await this.schemaClient.fetchSchemas(schemaApiUrl, headers);
    }

    async getSchema(entityName: string) {
        const schemaApiUrl = process.env.SCHEMA_API_URL || 'http://localhost:4000/api/schema';
        if (!schemaApiUrl) throw new Error('Schema configuration not found');

        const headers = process.env.SCHEMA_API_HEADERS ? JSON.parse(process.env.SCHEMA_API_HEADERS) : {};
        return await this.schemaClient.fetchSchema(schemaApiUrl, headers, entityName);
    }

    async getEnum(enumName: string) {
        const enumApiUrl = process.env.ENUM_API_URL || 'http://localhost:4000/api/enums';
        if (!enumApiUrl) throw new Error('Enum configuration not found');

        const headers = process.env.ENUM_API_HEADERS ? JSON.parse(process.env.ENUM_API_HEADERS) : {};
        return await this.schemaClient.fetchEnum(enumApiUrl, headers, enumName);
    }

    async getAllEnums() {
        const enumApiUrl = process.env.ENUM_API_URL || 'http://localhost:4000/api/enums';
        if (!enumApiUrl) throw new Error('Enum configuration not found');

        const headers = process.env.ENUM_API_HEADERS ? JSON.parse(process.env.ENUM_API_HEADERS) : {};
        return await this.schemaClient.fetchEnums(enumApiUrl, headers);
    }
}

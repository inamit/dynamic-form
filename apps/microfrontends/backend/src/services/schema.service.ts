import { SchemaClient } from '../clients/schema.client.js';

export class SchemaService {
    private schemaClient: SchemaClient;

    // ⚡ Bolt Optimization: Cache parsed API headers to avoid repeated synchronous JSON.parse overhead
    private static cachedSchemaHeaders: Record<string, string> | null = null;
    private static cachedEnumHeaders: Record<string, string> | null = null;

    constructor() {
        this.schemaClient = new SchemaClient();
    }

    private static getSchemaHeaders(): Record<string, string> {
        if (SchemaService.cachedSchemaHeaders === null) {
            SchemaService.cachedSchemaHeaders = process.env.SCHEMA_API_HEADERS ? JSON.parse(process.env.SCHEMA_API_HEADERS) : {};
        }
        return { ...SchemaService.cachedSchemaHeaders! };
    }

    private static getEnumHeaders(): Record<string, string> {
        if (SchemaService.cachedEnumHeaders === null) {
            SchemaService.cachedEnumHeaders = process.env.ENUM_API_HEADERS ? JSON.parse(process.env.ENUM_API_HEADERS) : {};
        }
        return { ...SchemaService.cachedEnumHeaders! };
    }

    async getSchemas() {
        const schemaApiUrl = process.env.SCHEMA_API_URL || 'http://localhost:4000/api/schemas';
        if (!schemaApiUrl) throw new Error('Schema configuration not found');

        const headers = SchemaService.getSchemaHeaders();
        return await this.schemaClient.fetchSchemas(schemaApiUrl, headers);
    }

    async getSchema(entityName: string) {
        const schemaApiUrl = process.env.SCHEMA_API_URL || 'http://localhost:4000/api/schema';
        if (!schemaApiUrl) throw new Error('Schema configuration not found');

        const headers = SchemaService.getSchemaHeaders();
        return await this.schemaClient.fetchSchema(schemaApiUrl, headers, entityName);
    }

    async getEnum(enumName: string) {
        const enumApiUrl = process.env.ENUM_API_URL || 'http://localhost:4000/api/enums';
        if (!enumApiUrl) throw new Error('Enum configuration not found');

        const headers = SchemaService.getEnumHeaders();
        return await this.schemaClient.fetchEnum(enumApiUrl, headers, enumName);
    }

    async getAllEnums() {
        const enumApiUrl = process.env.ENUM_API_URL || 'http://localhost:4000/api/enums';
        if (!enumApiUrl) throw new Error('Enum configuration not found');

        const headers = SchemaService.getEnumHeaders();
        return await this.schemaClient.fetchEnums(enumApiUrl, headers);
    }
}

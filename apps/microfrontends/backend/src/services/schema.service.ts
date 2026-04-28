import { SchemaClient } from '../clients/schema.client.js';

export class SchemaService {
    private schemaClient: SchemaClient;

    // ⚡ Bolt Optimization: Cache parsed schema/enum headers.
    // Parsing JSON from environment variables synchronously on every request
    // to SchemaService causes O(n) parsing overhead.
    // Since environment variables generally don't change during runtime,
    // caching the parsed object converts this to an O(1) operation.
    private static cachedSchemaHeaders: any | null = null;
    private static cachedEnumHeaders: any | null = null;

    constructor() {
        this.schemaClient = new SchemaClient();
    }

    private getSchemaHeaders() {
        if (!SchemaService.cachedSchemaHeaders) {
            SchemaService.cachedSchemaHeaders = process.env.SCHEMA_API_HEADERS
                ? JSON.parse(process.env.SCHEMA_API_HEADERS)
                : {};
        }
        return SchemaService.cachedSchemaHeaders;
    }

    private getEnumHeaders() {
        if (!SchemaService.cachedEnumHeaders) {
            SchemaService.cachedEnumHeaders = process.env.ENUM_API_HEADERS
                ? JSON.parse(process.env.ENUM_API_HEADERS)
                : {};
        }
        return SchemaService.cachedEnumHeaders;
    }

    async getSchemas() {
        const schemaApiUrl = process.env.SCHEMA_API_URL || 'http://localhost:4000/api/schemas';
        if (!schemaApiUrl) throw new Error('Schema configuration not found');

        return await this.schemaClient.fetchSchemas(schemaApiUrl, this.getSchemaHeaders());
    }

    async getSchema(entityName: string) {
        const schemaApiUrl = process.env.SCHEMA_API_URL || 'http://localhost:4000/api/schema';
        if (!schemaApiUrl) throw new Error('Schema configuration not found');

        return await this.schemaClient.fetchSchema(schemaApiUrl, this.getSchemaHeaders(), entityName);
    }

    async getEnum(enumName: string) {
        const enumApiUrl = process.env.ENUM_API_URL || 'http://localhost:4000/api/enums';
        if (!enumApiUrl) throw new Error('Enum configuration not found');

        return await this.schemaClient.fetchEnum(enumApiUrl, this.getEnumHeaders(), enumName);
    }

    async getAllEnums() {
        const enumApiUrl = process.env.ENUM_API_URL || 'http://localhost:4000/api/enums';
        if (!enumApiUrl) throw new Error('Enum configuration not found');

        return await this.schemaClient.fetchEnums(enumApiUrl, this.getEnumHeaders());
    }
}

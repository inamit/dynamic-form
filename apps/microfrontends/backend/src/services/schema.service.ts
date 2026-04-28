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

    // Cache the API responses themselves since they rarely change.
    private static cachedSchemas: any | null = null;
    private static cachedSchemaByName: Map<string, any> = new Map();
    private static cachedEnums: any | null = null;
    private static cachedEnumByName: Map<string, any> = new Map();

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
        if (SchemaService.cachedSchemas) {
            return JSON.parse(JSON.stringify(SchemaService.cachedSchemas)); // Clone to prevent mutation
        }

        const schemaApiUrl = process.env.SCHEMA_API_URL || 'http://localhost:4000/api/schemas';
        if (!schemaApiUrl) throw new Error('Schema configuration not found');

        const schemas = await this.schemaClient.fetchSchemas(schemaApiUrl, this.getSchemaHeaders());
        SchemaService.cachedSchemas = schemas;
        return JSON.parse(JSON.stringify(schemas));
    }

    async getSchema(entityName: string) {
        if (SchemaService.cachedSchemaByName.has(entityName)) {
            return JSON.parse(JSON.stringify(SchemaService.cachedSchemaByName.get(entityName)));
        }

        const schemaApiUrl = process.env.SCHEMA_API_URL || 'http://localhost:4000/api/schema';
        if (!schemaApiUrl) throw new Error('Schema configuration not found');

        const schema = await this.schemaClient.fetchSchema(schemaApiUrl, this.getSchemaHeaders(), entityName);
        SchemaService.cachedSchemaByName.set(entityName, schema);
        return JSON.parse(JSON.stringify(schema));
    }

    async getEnum(enumName: string) {
        if (SchemaService.cachedEnumByName.has(enumName)) {
            return JSON.parse(JSON.stringify(SchemaService.cachedEnumByName.get(enumName)));
        }

        const enumApiUrl = process.env.ENUM_API_URL || 'http://localhost:4000/api/enums';
        if (!enumApiUrl) throw new Error('Enum configuration not found');

        const enumData = await this.schemaClient.fetchEnum(enumApiUrl, this.getEnumHeaders(), enumName);
        SchemaService.cachedEnumByName.set(enumName, enumData);
        return JSON.parse(JSON.stringify(enumData));
    }

    async getAllEnums() {
        if (SchemaService.cachedEnums) {
            return JSON.parse(JSON.stringify(SchemaService.cachedEnums));
        }

        const enumApiUrl = process.env.ENUM_API_URL || 'http://localhost:4000/api/enums';
        if (!enumApiUrl) throw new Error('Enum configuration not found');

        const enums = await this.schemaClient.fetchEnums(enumApiUrl, this.getEnumHeaders());
        SchemaService.cachedEnums = enums;
        return JSON.parse(JSON.stringify(enums));
    }
}

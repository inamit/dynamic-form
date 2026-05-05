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
    // Include a configurable TTL (Time-To-Live) so schema/enum updates aren't missed forever.
    private static cachedSchemas: { data: any, timestamp: number } | null = null;
    private static cachedSchemaByName: Map<string, { data: any, timestamp: number }> = new Map();
    private static cachedEnums: { data: any, timestamp: number } | null = null;
    private static cachedEnumByName: Map<string, { data: any, timestamp: number }> = new Map();

    constructor() {
        this.schemaClient = new SchemaClient();
    }

    private getCacheTTLMs(): number {
        const ttlMinutes = parseInt(process.env.SCHEMA_CACHE_TTL_MINUTES || '5', 10);
        return ttlMinutes * 60 * 1000;
    }

    private isCacheValid(timestamp: number): boolean {
        return (Date.now() - timestamp) < this.getCacheTTLMs();
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

    // ⚡ Bolt Optimization: Replace JSON.parse(JSON.stringify()) with structuredClone()
    // structuredClone avoids unnecessary string allocation, serialization,
    // and garbage collection overhead, improving CPU performance and memory usage.

    async getSchemas() {
        if (SchemaService.cachedSchemas && this.isCacheValid(SchemaService.cachedSchemas.timestamp)) {
            return structuredClone(SchemaService.cachedSchemas.data); // Clone to prevent mutation
        }

        const schemaApiUrl = process.env.SCHEMA_API_URL || 'http://localhost:4000/api/schemas';
        if (!schemaApiUrl) throw new Error('Schema configuration not found');

        const schemas = await this.schemaClient.fetchSchemas(schemaApiUrl, this.getSchemaHeaders());
        SchemaService.cachedSchemas = { data: schemas, timestamp: Date.now() };
        return structuredClone(schemas);
    }

    async getSchema(entityName: string) {
        const cached = SchemaService.cachedSchemaByName.get(entityName);
        if (cached && this.isCacheValid(cached.timestamp)) {
            return structuredClone(cached.data);
        }

        const schemaApiUrl = process.env.SCHEMA_API_URL || 'http://localhost:4000/api/schema';
        if (!schemaApiUrl) throw new Error('Schema configuration not found');

        const schema = await this.schemaClient.fetchSchema(schemaApiUrl, this.getSchemaHeaders(), entityName);
        SchemaService.cachedSchemaByName.set(entityName, { data: schema, timestamp: Date.now() });
        return structuredClone(schema);
    }

    async getEnum(enumName: string) {
        const cached = SchemaService.cachedEnumByName.get(enumName);
        if (cached && this.isCacheValid(cached.timestamp)) {
            return structuredClone(cached.data);
        }

        const enumApiUrl = process.env.ENUM_API_URL || 'http://localhost:4000/api/enums';
        if (!enumApiUrl) throw new Error('Enum configuration not found');

        const enumData = await this.schemaClient.fetchEnum(enumApiUrl, this.getEnumHeaders(), enumName);
        SchemaService.cachedEnumByName.set(enumName, { data: enumData, timestamp: Date.now() });
        return structuredClone(enumData);
    }

    async getAllEnums() {
        if (SchemaService.cachedEnums && this.isCacheValid(SchemaService.cachedEnums.timestamp)) {
            return structuredClone(SchemaService.cachedEnums.data);
        }

        const enumApiUrl = process.env.ENUM_API_URL || 'http://localhost:4000/api/enums';
        if (!enumApiUrl) throw new Error('Enum configuration not found');

        const enums = await this.schemaClient.fetchEnums(enumApiUrl, this.getEnumHeaders());
        SchemaService.cachedEnums = { data: enums, timestamp: Date.now() };
        return structuredClone(enums);
    }
}

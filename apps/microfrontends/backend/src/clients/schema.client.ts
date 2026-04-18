import axios from 'axios';
import { validateUrl } from '../utils.js';

export class SchemaClient {
    async fetchSchemas(schemasApiUrl: string, headers: any) {
        const response = await axios.get(validateUrl(schemasApiUrl), { headers });
        return response.data;
    }

    async fetchSchema(schemaApiUrl: string, headers: any, entityName: string) {
        const entitySchemaUrl = `${schemaApiUrl}/${entityName}`;
        const response = await axios.get(validateUrl(entitySchemaUrl), { headers });
        return response.data;
    }

    async fetchEnums(enumApiUrl: string, headers: any) {
        const response = await axios.get(validateUrl(enumApiUrl), { headers });
        return response.data;
    }

    async fetchEnum(enumApiUrl: string, headers: any, enumName: string) {
        const url = `${enumApiUrl}/${enumName}`;
        const response = await axios.get(validateUrl(url), { headers });
        return response.data;
    }
}

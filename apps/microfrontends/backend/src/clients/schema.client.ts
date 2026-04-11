import axios from 'axios';
import { validateUrl } from '../utils.js';

export class SchemaClient {
    async fetchSchemas(apiUrl: string, headers: any) {
        const schemasApiUrl = apiUrl.replace('/enums', '/schemas');
        const response = await axios.get(validateUrl(schemasApiUrl), { headers });
        return response.data;
    }

    async fetchSchema(apiUrl: string, headers: any, entityName: string) {
        const schemasApiUrl = apiUrl.replace('/enums', '/schema');
        const entitySchemaUrl = `${schemasApiUrl}/${entityName}`;
        const response = await axios.get(validateUrl(entitySchemaUrl), { headers });
        return response.data;
    }

    async fetchEnum(apiUrl: string, headers: any, enumName: string) {
        const url = `${apiUrl}/${enumName}`;
        const response = await axios.get(validateUrl(url), { headers });
        return response.data;
    }
}

import { request, gql } from 'graphql-request';
import { validateUrl } from '../utils.js';
import { IDataClient } from './data.client.js';

export class GraphqlDataClient implements IDataClient {
    async getData(apiUrl: string, queryStr: string, entity: string) {
        const query = gql`${queryStr}`;
        const data = await request(validateUrl(apiUrl), query) as any;
        return data[`${entity}s`];
    }

    async getDataById(apiUrl: string, id: string, queryStr: string, entity: string) {
        const query = gql`${queryStr}`;
        const variables = { id };
        const data = await request(validateUrl(apiUrl), query, variables) as any;
        return data[entity];
    }

    async createData(apiUrl: string, data: any, queryStr: string, entity: string, config: any) {
        const mutation = gql`${queryStr}`;
        const variables: Record<string, any> = {};
        if (config?.fields) {
            config.fields.forEach((f: any) => {
                variables[f.name] = data[f.name];
            });
        }
        const responseData = await request(validateUrl(apiUrl), mutation, variables) as any;
        return responseData[`create${entity.charAt(0).toUpperCase() + entity.slice(1)}`];
    }

    async updateData(apiUrl: string, id: string, data: any, queryStr: string, entity: string, config: any) {
        const mutation = gql`${queryStr}`;
        const variables: Record<string, any> = { id };
        if (config?.fields) {
            config.fields.forEach((f: any) => {
                if (data[f.name] !== undefined) {
                    variables[f.name] = data[f.name];
                }
            });
        }
        const responseData = await request(validateUrl(apiUrl), mutation, variables) as any;
        return responseData[`update${entity.charAt(0).toUpperCase() + entity.slice(1)}`];
    }

    async deleteData(apiUrl: string, id: string, queryStr: string, entity: string) {
        const mutation = gql`${queryStr}`;
        const variables = { id };
        const responseData = await request(validateUrl(apiUrl), mutation, variables) as any;
        return responseData[`delete${entity.charAt(0).toUpperCase() + entity.slice(1)}`];
    }
}

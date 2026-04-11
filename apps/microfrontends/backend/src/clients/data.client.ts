import axios from 'axios';
import { request, gql } from 'graphql-request';
import { validateUrl } from '../utils.js';

export class DataClient {
    async getRestData(apiUrl: string) {
        const response = await axios.get(validateUrl(apiUrl));
        return response.data;
    }

    async getRestDataById(apiUrl: string, id: string) {
        const response = await axios.get(validateUrl(`${apiUrl}/${id}`));
        return response.data;
    }

    async createRestData(apiUrl: string, data: any) {
        const response = await axios.post(validateUrl(apiUrl), data);
        return response.data;
    }

    async updateRestData(apiUrl: string, id: string, data: any) {
        const response = await axios.put(validateUrl(`${apiUrl}/${id}`), data);
        return response.data;
    }

    async deleteRestData(apiUrl: string, id: string) {
        const response = await axios.delete(validateUrl(`${apiUrl}/${id}`));
        return response.data;
    }

    async getGraphqlData(apiUrl: string, queryStr: string, entity: string) {
        const query = gql`${queryStr}`;
        const data = await request(validateUrl(apiUrl), query) as any;
        return data[`${entity}s`];
    }

    async getGraphqlDataById(apiUrl: string, queryStr: string, entity: string, id: string) {
        const query = gql`${queryStr}`;
        const variables = { id };
        const data = await request(validateUrl(apiUrl), query, variables) as any;
        return data[entity];
    }

    async createGraphqlData(apiUrl: string, queryStr: string, entity: string, variables: any) {
        const mutation = gql`${queryStr}`;
        const data = await request(validateUrl(apiUrl), mutation, variables) as any;
        return data[`create${entity.charAt(0).toUpperCase() + entity.slice(1)}`];
    }

    async updateGraphqlData(apiUrl: string, queryStr: string, entity: string, variables: any) {
        const mutation = gql`${queryStr}`;
        const data = await request(validateUrl(apiUrl), mutation, variables) as any;
        return data[`update${entity.charAt(0).toUpperCase() + entity.slice(1)}`];
    }

    async deleteGraphqlData(apiUrl: string, queryStr: string, entity: string, variables: any) {
        const mutation = gql`${queryStr}`;
        const data = await request(validateUrl(apiUrl), mutation, variables) as any;
        return data[`delete${entity.charAt(0).toUpperCase() + entity.slice(1)}`];
    }
}

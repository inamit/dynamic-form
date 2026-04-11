import axios from 'axios';
import { validateUrl } from '../utils.js';
import { IDataClient } from './data.client.js';

export class RestDataClient implements IDataClient {
    private getRequestOptions(apiUrl: string, queryStr: string | undefined, id?: string) {
        if (!queryStr) throw new Error('Missing queryStr for REST operation');
        const config = JSON.parse(queryStr);
        let endpoint = config.endpoint || '';

        if (id && endpoint.includes(':id')) {
            endpoint = endpoint.replace(':id', id);
        } else if (id) {
            // fallback if someone just uses the base path without :id
            endpoint = endpoint.endsWith('/') ? `${endpoint}${id}` : `${endpoint}/${id}`;
        }

        // Remove trailing slash from apiUrl and leading slash from endpoint to construct valid url
        const cleanApiUrl = apiUrl.replace(/\/+$/, '');
        const cleanEndpoint = endpoint.replace(/^\/+/, '');
        const fullUrl = cleanEndpoint ? `${cleanApiUrl}/${cleanEndpoint}` : cleanApiUrl;

        return {
            url: validateUrl(fullUrl),
            method: config.method?.toUpperCase() || 'GET'
        };
    }

    async getData(apiUrl: string, queryStr?: string, entity?: string) {
        const { url, method } = this.getRequestOptions(apiUrl, queryStr);
        const response = await axios({ url, method });
        return response.data;
    }

    async getDataById(apiUrl: string, id: string, queryStr?: string, entity?: string) {
        const { url, method } = this.getRequestOptions(apiUrl, queryStr, id);
        const response = await axios({ url, method });
        return response.data;
    }

    async createData(apiUrl: string, data: any, queryStr?: string, entity?: string, config?: any) {
        const { url, method } = this.getRequestOptions(apiUrl, queryStr);
        const response = await axios({ url, method, data });
        return response.data;
    }

    async updateData(apiUrl: string, id: string, data: any, queryStr?: string, entity?: string, config?: any) {
        const { url, method } = this.getRequestOptions(apiUrl, queryStr, id);
        const response = await axios({ url, method, data });
        return response.data;
    }

    async deleteData(apiUrl: string, id: string, queryStr?: string, entity?: string) {
        const { url, method } = this.getRequestOptions(apiUrl, queryStr, id);
        const response = await axios({ url, method });
        return response.data;
    }
}

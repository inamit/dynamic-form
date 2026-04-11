import axios from 'axios';
import { validateUrl } from '../utils.js';
import { IDataClient } from './data.client.js';

export class RestDataClient implements IDataClient {
    async getData(apiUrl: string) {
        const response = await axios.get(validateUrl(apiUrl));
        return response.data;
    }

    async getDataById(apiUrl: string, id: string) {
        const response = await axios.get(validateUrl(`${apiUrl}/${id}`));
        return response.data;
    }

    async createData(apiUrl: string, data: any) {
        const response = await axios.post(validateUrl(apiUrl), data);
        return response.data;
    }

    async updateData(apiUrl: string, id: string, data: any) {
        const response = await axios.put(validateUrl(`${apiUrl}/${id}`), data);
        return response.data;
    }

    async deleteData(apiUrl: string, id: string) {
        const response = await axios.delete(validateUrl(`${apiUrl}/${id}`));
        return response.data;
    }
}

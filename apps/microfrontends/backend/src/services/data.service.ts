import { EntityRepository } from '../repositories/entity.repository.js';
import { IDataClient } from '../clients/data.client.js';
import { RestDataClient } from '../clients/rest-data.client.js';
import { GraphqlDataClient } from '../clients/graphql-data.client.js';
import { OrchestratorService } from './orchestrator.service.js';

export class DataService {
    private entityRepository: EntityRepository;

    constructor() {
        this.entityRepository = new EntityRepository();
    }

    private getClient(apiType: string): IDataClient {
        if (apiType === 'REST') {
            return new RestDataClient();
        } else if (apiType === 'GRAPHQL') {
            return new GraphqlDataClient();
        }
        throw new Error('Unsupported API type');
    }

    private getQueryString(ds: any, operation: string): string {
        const ops = JSON.parse(ds.endpointsQueries || '{}');
        const queryStr = ops[operation];
        if (!queryStr) throw new Error(`Missing '${operation}' query configuration`);
        return queryStr;
    }

    async getData(entityName: string, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const ds = config.dataSource;
        const client = this.getClient(ds.apiType);

        let dataList: any[] = [];
        if (ds.apiType === 'REST') {
            dataList = await client.getData(ds.apiUrl);
        } else {
            const queryStr = this.getQueryString(ds, 'list');
            dataList = await client.getData(ds.apiUrl, queryStr, entityName);
        }

        const filteredList = [];
        for (const item of dataList) {
            const auth = await OrchestratorService.checkAuth(userId, origin, entityName, 'view', config, item);
            if (auth.allowed) {
                filteredList.push(item);
            }
        }
        return filteredList;
    }

    async getDataById(entityName: string, id: string, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const ds = config.dataSource;
        const client = this.getClient(ds.apiType);

        let itemData: any = null;
        if (ds.apiType === 'REST') {
            itemData = await client.getDataById(ds.apiUrl, id);
        } else {
            const queryStr = this.getQueryString(ds, 'get');
            itemData = await client.getDataById(ds.apiUrl, id, queryStr, entityName);
        }

        if (itemData) {
            const auth = await OrchestratorService.checkAuth(userId, origin, entityName, 'view', config, itemData);
            if (!auth.allowed) {
                throw new Error('Forbidden');
            }
        }

        return itemData;
    }

    async createData(entityName: string, data: any, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const authCreate = await OrchestratorService.checkAuth(userId, origin, entityName, 'create', config, data);
        if (!authCreate.allowed) throw new Error('Forbidden');

        const ds = config.dataSource;
        const client = this.getClient(ds.apiType);

        if (ds.apiType === 'REST') {
            return await client.createData(ds.apiUrl, data);
        } else {
            const queryStr = this.getQueryString(ds, 'create');
            return await client.createData(ds.apiUrl, data, queryStr, entityName, config);
        }
    }

    async updateData(entityName: string, id: string, data: any, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const authEdit = await OrchestratorService.checkAuth(userId, origin, entityName, 'edit', config, { id, ...data });
        if (!authEdit.allowed) throw new Error('Forbidden');

        const ds = config.dataSource;
        const client = this.getClient(ds.apiType);

        if (ds.apiType === 'REST') {
            return await client.updateData(ds.apiUrl, id, data);
        } else {
            const queryStr = this.getQueryString(ds, 'update');
            return await client.updateData(ds.apiUrl, id, data, queryStr, entityName, config);
        }
    }

    async deleteData(entityName: string, id: string, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        let itemData: any = null;
        const ds = config.dataSource;
        const client = this.getClient(ds.apiType);

        if (ds.apiType === 'REST') {
            try {
                itemData = await client.getDataById(ds.apiUrl, id);
            } catch (e) {}
        } else if (ds.apiType === 'GRAPHQL') {
            try {
                const getQueryStr = this.getQueryString(ds, 'get');
                itemData = await client.getDataById(ds.apiUrl, id, getQueryStr, entityName);
            } catch (e) {}
        }

        const authDelete = await OrchestratorService.checkAuth(userId, origin, entityName, 'delete', config, itemData || { id });
        if (!authDelete.allowed) throw new Error('Forbidden');

        if (ds.apiType === 'REST') {
            return await client.deleteData(ds.apiUrl, id);
        } else {
            const queryStr = this.getQueryString(ds, 'delete');
            return await client.deleteData(ds.apiUrl, id, queryStr, entityName);
        }
    }
}

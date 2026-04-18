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

    private getQueryString(config: any, operation: string, apiType: string): any {
        const ops = JSON.parse(config.endpointsQueries || '{}');
        const queryStr = ops[operation];
        if (!queryStr) throw new Error(`Missing '${operation}' query configuration`);
        return apiType === 'REST' ? JSON.stringify(queryStr) : queryStr;
    }

    async getData(entityName: string, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const ds = config.dataSource;
        const client = this.getClient(ds.apiType);

        const queryStr = this.getQueryString(config, 'list', ds.apiType);
        let dataList = await client.getData(ds.apiUrl, queryStr, entityName);

        const filteredList: any[] = [];
        const CONCURRENCY_LIMIT = parseInt(process.env.DATA_AUTH_ORCHESTRATOR_CONCURRENCY || '5', 10);

        // ⚡ Bolt Optimization: Replace sequential chunking with a sliding-window promise pool.
        // This keeps exactly `CONCURRENCY_LIMIT` tasks in flight at all times, avoiding pipeline stalls
        // caused by waiting for the slowest task in a chunk before starting the next batch.
        const executing: Promise<any>[] = [];
        const results: Promise<{ allowed: boolean, item: any }>[] = [];

        for (const item of dataList) {
            const p = OrchestratorService.checkAuth(userId, origin, entityName, 'view', config, item)
                .then(authResult => ({ allowed: authResult.allowed, item }))
                .catch(() => ({ allowed: false, item })); // Fail open/closed gracefully without crashing process

            results.push(p);

            const e = p.then(() => {
                executing.splice(executing.indexOf(e), 1);
            });
            executing.push(e);

            if (executing.length >= CONCURRENCY_LIMIT) {
                await Promise.race(executing);
            }
        }

        const authResults = await Promise.all(results);
        authResults.forEach(res => {
            if (res.allowed) {
                filteredList.push(res.item);
            }
        });

        return filteredList;
    }

    async getDataById(entityName: string, id: string, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const ds = config.dataSource;
        const client = this.getClient(ds.apiType);

        const queryStr = this.getQueryString(config, 'get', ds.apiType);
        let itemData = await client.getDataById(ds.apiUrl, id, queryStr, entityName);

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

        const queryStr = this.getQueryString(config, 'create', ds.apiType);
        return await client.createData(ds.apiUrl, data, queryStr, entityName, config);
    }

    async updateData(entityName: string, id: string, data: any, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const authEdit = await OrchestratorService.checkAuth(userId, origin, entityName, 'edit', config, { id, ...data });
        if (!authEdit.allowed) throw new Error('Forbidden');

        const ds = config.dataSource;
        const client = this.getClient(ds.apiType);

        const queryStr = this.getQueryString(config, 'update', ds.apiType);
        return await client.updateData(ds.apiUrl, id, data, queryStr, entityName, config);
    }

    async deleteData(entityName: string, id: string, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        let itemData: any = null;
        const ds = config.dataSource;
        const client = this.getClient(ds.apiType);

        const getQueryStr = this.getQueryString(config, 'get', ds.apiType);
        try {
            itemData = await client.getDataById(ds.apiUrl, id, getQueryStr, entityName);
        } catch (e) {}

        const authDelete = await OrchestratorService.checkAuth(userId, origin, entityName, 'delete', config, itemData || { id });
        if (!authDelete.allowed) throw new Error('Forbidden');

        const queryStr = this.getQueryString(config, 'delete', ds.apiType);
        return await client.deleteData(ds.apiUrl, id, queryStr, entityName);
    }
}

import { EntityRepository } from '../repositories/entity.repository.js';
import { DataClient } from '../clients/data.client.js';
import { OrchestratorService } from './orchestrator.service.js';

export class DataService {
    private entityRepository: EntityRepository;
    private dataClient: DataClient;

    constructor() {
        this.entityRepository = new EntityRepository();
        this.dataClient = new DataClient();
    }

    async getEntityAbilities(entityName: string, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const [viewAuth, createAuth, editAuth, deleteAuth] = await Promise.all([
            OrchestratorService.checkAuth(userId, origin, entityName, 'view', config),
            OrchestratorService.checkAuth(userId, origin, entityName, 'create', config),
            OrchestratorService.checkAuth(userId, origin, entityName, 'edit', config),
            OrchestratorService.checkAuth(userId, origin, entityName, 'delete', config)
        ]);

        return {
            canView: viewAuth.allowed,
            canCreate: createAuth.allowed,
            canEdit: editAuth.allowed,
            canDelete: deleteAuth.allowed
        };
    }

    async getData(entityName: string, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const ds = config.dataSource;
        let dataList: any[] = [];

        if (ds.apiType === 'REST') {
            dataList = await this.dataClient.getRestData(ds.apiUrl);
        } else if (ds.apiType === 'GRAPHQL') {
            const ops = JSON.parse(ds.endpointsQueries || '{}');
            const queryStr = ops.list;
            if (!queryStr) throw new Error("Missing 'list' query configuration");
            dataList = await this.dataClient.getGraphqlData(ds.apiUrl, queryStr, entityName);
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
        let itemData: any = null;

        if (ds.apiType === 'REST') {
            itemData = await this.dataClient.getRestDataById(ds.apiUrl, id);
        } else if (ds.apiType === 'GRAPHQL') {
            const ops = JSON.parse(ds.endpointsQueries || '{}');
            const queryStr = ops.get;
            if (!queryStr) throw new Error("Missing 'get' query configuration");
            itemData = await this.dataClient.getGraphqlDataById(ds.apiUrl, queryStr, entityName, id);
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
        if (ds.apiType === 'REST') {
            return await this.dataClient.createRestData(ds.apiUrl, data);
        } else if (ds.apiType === 'GRAPHQL') {
            const ops = JSON.parse(ds.endpointsQueries || '{}');
            const queryStr = ops.create;
            if (!queryStr) throw new Error("Missing 'create' query configuration");

            const variables: Record<string, any> = {};
            config.fields.forEach((f: any) => {
                variables[f.name] = data[f.name];
            });
            return await this.dataClient.createGraphqlData(ds.apiUrl, queryStr, entityName, variables);
        }
    }

    async updateData(entityName: string, id: string, data: any, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        const authEdit = await OrchestratorService.checkAuth(userId, origin, entityName, 'edit', config, { id, ...data });
        if (!authEdit.allowed) throw new Error('Forbidden');

        const ds = config.dataSource;
        if (ds.apiType === 'REST') {
            return await this.dataClient.updateRestData(ds.apiUrl, id, data);
        } else if (ds.apiType === 'GRAPHQL') {
            const ops = JSON.parse(ds.endpointsQueries || '{}');
            const queryStr = ops.update;
            if (!queryStr) throw new Error("Missing 'update' query configuration");

            const variables: Record<string, any> = { id };
            config.fields.forEach((f: any) => {
                if (data[f.name] !== undefined) {
                    variables[f.name] = data[f.name];
                }
            });
            return await this.dataClient.updateGraphqlData(ds.apiUrl, queryStr, entityName, variables);
        }
    }

    async deleteData(entityName: string, id: string, userId: string, origin: string) {
        const config = await this.entityRepository.findEntityConfig(entityName);
        if (!config) throw new Error('Entity not found');

        let itemData: any = null;
        const ds = config.dataSource;

        if (ds.apiType === 'REST') {
            try {
                itemData = await this.dataClient.getRestDataById(ds.apiUrl, id);
            } catch (e) {}
        } else if (ds.apiType === 'GRAPHQL') {
            try {
                const ops = JSON.parse(ds.endpointsQueries || '{}');
                const getQueryStr = ops.get;
                if (getQueryStr) {
                    itemData = await this.dataClient.getGraphqlDataById(ds.apiUrl, getQueryStr, entityName, id);
                }
            } catch (e) {}
        }

        const authDelete = await OrchestratorService.checkAuth(userId, origin, entityName, 'delete', config, itemData || { id });
        if (!authDelete.allowed) throw new Error('Forbidden');

        if (ds.apiType === 'REST') {
            return await this.dataClient.deleteRestData(ds.apiUrl, id);
        } else if (ds.apiType === 'GRAPHQL') {
            const ops = JSON.parse(ds.endpointsQueries || '{}');
            const queryStr = ops.delete;
            if (!queryStr) throw new Error("Missing 'delete' query configuration");
            const variables = { id };
            return await this.dataClient.deleteGraphqlData(ds.apiUrl, queryStr, entityName, variables);
        }
    }
}

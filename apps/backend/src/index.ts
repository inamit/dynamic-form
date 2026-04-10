import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import {PrismaPGlite} from 'pglite-prisma-adapter';
import {PGlite} from '@electric-sql/pglite';
import axios from 'axios';
import {request, gql} from 'graphql-request';
import {PrismaPg} from "@prisma/adapter-pg";

const app = express();
import setupManagementRoutes from "./management.js";
import { validateUrl } from "./utils.js";

let prisma: any;

if (process.env.NODE_ENV === 'production' || process.env.USE_REAL_POSTGRES === 'true') {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
    });
    prisma = new PrismaClient({adapter});
} else {
    const client = new PGlite('./pglite-db');
    const adapter = new PrismaPGlite(client);
    prisma = new PrismaClient({adapter});
}

app.use(cors());
app.use(express.json());
app.use(cookieParser());
setupManagementRoutes(app, prisma);

// Orchestrator Helper
async function checkAuth(req: express.Request, entityName: string, ability: string, config: any, data?: any) {
    let services = [];
    try {
        if (ability === 'view' && config.authView) services = JSON.parse(config.authView);
        if (ability === 'create' && config.authCreate) services = JSON.parse(config.authCreate);
        if (ability === 'edit' && config.authEdit) services = JSON.parse(config.authEdit);
        if (ability === 'delete' && config.authDelete) services = JSON.parse(config.authDelete);
    } catch (e) {
        console.error('Error parsing auth config', e);
    }

    // Default to 'custom' if not specified for test
    if (services.length === 0) services = ['custom'];

    let userId = req.cookies.jwt_user_id || 'anonymous';
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        if (token) userId = 'user_from_token'; // mock decoding
    }

    // During tests without reverse proxies, use origin or a mock
    const origin = req.headers.origin || 'http://localhost:5001';

    try {
        const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:3005/api/authorize';
        const res = await axios.post(orchestratorUrl, {
            userId,
            origin,
            entityName,
            ability,
            data,
            services
        });
        return res.data;
    } catch (error: any) {
        console.error('Error checking auth via orchestrator:', error.message);
        return { allowed: false, reason: 'Orchestrator unavailable' };
    }
}

// --- CONFIGURATION ENDPOINTS ---

app.get('/api/config', async (req, res) => {
    try {
        console.log('GET /api/config');
        const configs = await prisma.entityConfig.findMany({
            include: {dataSource: true, fields: true}
        });

        const parsedConfigs = configs.map((c: any) => ({
            ...c,
            apiUrl: c.dataSource.apiUrl,
            apiType: c.dataSource.apiType
        }));

        res.json(parsedConfigs);
    } catch (error) {
        console.error('Error in GET /api/config:', error);
        res.status(500).json({error: 'Failed to fetch configurations'});
    }
});

app.get('/api/config/:name', async (req, res) => {
    try {
        console.log(`GET /api/config/${req.params.name}`);
        const config = await prisma.entityConfig.findUnique({
            where: {name: req.params.name},
            include: {dataSource: true, fields: true, presets: true}
        });

        if (!config) {
            console.log(`Configuration not found: ${req.params.name}`);
            return res.status(404).json({error: 'Configuration not found'});
        }

        res.json({
            ...config,
            apiUrl: config.dataSource.apiUrl,
            apiType: config.dataSource.apiType,
            presets: config.presets?.map((p: any) => ({
                ...p,
                defaultValues: p.defaultValues ? JSON.parse(p.defaultValues) : undefined
            }))
        });
    } catch (error) {
        console.error(`Error in GET /api/config/${req.params.name}:`, error);
        res.status(500).json({error: 'Failed to fetch configuration'});
    }
});

app.post('/api/config', async (req, res) => {
    res.status(501).json({error: 'Creating endpoints via config dynamically disabled for now.'});
});


// --- SCHEMA ENDPOINTS ---

app.get('/api/schemas', async (req, res) => {
    try {
        console.log(`GET /api/schemas`);

        const ds = await prisma.dataSource.findUnique({
            where: {name: 'enum'}
        });

        if (!ds) {
            console.log('Enum/Schema data source not found');
            return res.status(404).json({error: 'Data source not found'});
        }

        const schemasApiUrl = ds.apiUrl.replace('/enums', '/schemas');
        const headers = ds.headers ? JSON.parse(ds.headers) : {};
        const response = await axios.get(validateUrl(schemasApiUrl), { headers });
        res.json(response.data);
    } catch (error: any) {
        console.error(`Error in GET /api/schemas:`, error.message);
        res.status(500).json({error: 'Failed to fetch schemas list'});
    }
});

app.get('/api/schema/:entityName', async (req, res) => {
    try {
        const {entityName} = req.params;

        // Prevent path traversal
        if (entityName.includes('/') || entityName.includes('..')) {
            return res.status(400).json({error: 'Invalid entityName'});
        }

        console.log(`GET /api/schema/${entityName}`);

        // Since schema is exposed by the mock API on /api/schema
        // and we don't have a specific data source configured for it,
        // we'll fetch it using the 'enum' datasource URL logic
        const ds = await prisma.dataSource.findUnique({
            where: {name: 'enum'}
        });

        if (!ds) {
            console.log('Enum/Schema data source not found');
            return res.status(404).json({error: 'Data source not found'});
        }

        // URL parsing: ds.apiUrl is likely something like "http://localhost:4000/api/enums"
        // so we replace "enums" with "schema"
        const schemaApiUrl = ds.apiUrl.replace('/enums', '/schema');

        const headers = ds.headers ? JSON.parse(ds.headers) : {};
        const response = await axios.get(validateUrl(`${schemaApiUrl}/${entityName}`), { headers });
        res.json(response.data);
    } catch (error: any) {
        console.error(`Error in GET /api/schema/${req.params.entityName}:`, error.message);
        res.status(500).json({error: 'Failed to fetch schema'});
    }
});

// --- ENUM ENDPOINTS ---

app.get('/api/enums/:enumName', async (req, res) => {
    try {
        const {enumName} = req.params;

        // Prevent path traversal
        if (enumName.includes('/') || enumName.includes('..')) {
            return res.status(400).json({error: 'Invalid enumName'});
        }

        console.log(`GET /api/enums/${enumName}`);
        const ds = await prisma.dataSource.findUnique({
            where: {name: 'enum'}
        });

        if (!ds) {
            console.log('Enum data source not found');
            return res.status(404).json({error: 'Enum data source not found'});
        }

        const headers = ds.headers ? JSON.parse(ds.headers) : {};
        const response = await axios.get(validateUrl(`${ds.apiUrl}/${enumName}`), { headers });
        res.json(response.data);
    } catch (error: any) {
        console.error(`Error in GET /api/enums/${req.params.enumName}:`, error.message);
        res.status(500).json({error: 'Failed to fetch enum values'});
    }
});


// --- ABILITIES ENDPOINT ---

app.get('/api/data/:entity/abilities', async (req, res) => {
    const {entity} = req.params;

    // Prevent path traversal
    if (entity.includes('/') || entity.includes('..')) {
        return res.status(400).json({error: 'Invalid entity'});
    }

    const config = await prisma.entityConfig.findUnique({
        where: {name: entity}
    });

    if (!config) {
        return res.status(404).json({error: 'Entity not found'});
    }

    const [viewAuth, createAuth, editAuth, deleteAuth] = await Promise.all([
        checkAuth(req, entity, 'view', config),
        checkAuth(req, entity, 'create', config),
        checkAuth(req, entity, 'edit', config),
        checkAuth(req, entity, 'delete', config)
    ]);

    res.json({
        canView: viewAuth.allowed,
        canCreate: createAuth.allowed,
        canEdit: editAuth.allowed,
        canDelete: deleteAuth.allowed
    });
});

// --- DATA PROXY ENDPOINTS ---

app.get('/api/data/:entity', async (req, res) => {
    const {entity} = req.params;

    // Prevent path traversal
    if (entity.includes('/') || entity.includes('..')) {
        return res.status(400).json({error: 'Invalid entity'});
    }

    console.log(`GET /api/data/${entity}`);
    const config = await prisma.entityConfig.findUnique({
        where: {name: entity},
        include: {dataSource: true, fields: true}
    });

    if (!config) {
        console.log(`Entity not found: ${entity}`);
        return res.status(404).json({error: 'Entity not found'});
    }

    try {
        const ds = config.dataSource;
        console.log(`Using data source ${ds.name} (${ds.apiType}) at ${ds.apiUrl}`);
        let dataList: any[] = [];

        if (ds.apiType === 'REST') {
            const response = await axios.get(validateUrl(ds.apiUrl));
            dataList = response.data;
        } else if (ds.apiType === 'GRAPHQL') {
            const ops = JSON.parse(ds.endpointsQueries || '{}');
            const queryStr = ops.list;
            if (!queryStr) throw new Error("Missing 'list' query configuration");

            const query = gql`${queryStr}`;
            const data = await request(validateUrl(ds.apiUrl), query) as any;
            dataList = data[`${entity}s`];
        }

        // Filter list based on view permissions per row
        const filteredList = [];
        for (const item of dataList) {
             const auth = await checkAuth(req, entity, 'view', config, item);
             if (auth.allowed) {
                 filteredList.push(item);
             }
        }
        res.json(filteredList);

    } catch (error: any) {
        console.error(`Error in GET /api/data/${entity}:`, error.message);
        res.status(500).json({error: 'Failed to fetch data'});
    }
});

app.get('/api/data/:entity/:id', async (req, res) => {
    const {entity, id} = req.params;

    // Prevent path traversal
    if (entity.includes('/') || entity.includes('..')) {
        return res.status(400).json({error: 'Invalid entity'});
    }
    if (id.includes('/') || id.includes('..')) {
        return res.status(400).json({error: 'Invalid id'});
    }

    console.log(`GET /api/data/${entity}/${id}`);
    const config = await prisma.entityConfig.findUnique({
        where: {name: entity},
        include: {dataSource: true, fields: true}
    });

    if (!config) {
        console.log(`Entity not found: ${entity}`);
        return res.status(404).json({error: 'Entity not found'});
    }

    try {
        const ds = config.dataSource;
        console.log(`Using data source ${ds.name} (${ds.apiType}) at ${ds.apiUrl}`);
        let itemData: any = null;

        if (ds.apiType === 'REST') {
            const response = await axios.get(validateUrl(`${ds.apiUrl}/${id}`));
            itemData = response.data;
        } else if (ds.apiType === 'GRAPHQL') {
            const ops = JSON.parse(ds.endpointsQueries || '{}');
            const queryStr = ops.get;
            if (!queryStr) throw new Error("Missing 'get' query configuration");

            const query = gql`${queryStr}`;
            const variables = {id};
            const data = await request(validateUrl(ds.apiUrl), query, variables) as any;
            itemData = data[entity];
        }

        if (itemData) {
            const auth = await checkAuth(req, entity, 'view', config, itemData);
            if (!auth.allowed) {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }

        res.json(itemData);
    } catch (error: any) {
        console.error(`Error in GET /api/data/${entity}/${id}:`, error.message);
        res.status(500).json({error: 'Failed to fetch data'});
    }
});

app.post('/api/data/:entity', async (req, res) => {
    const {entity} = req.params;

    // Prevent path traversal
    if (entity.includes('/') || entity.includes('..')) {
        return res.status(400).json({error: 'Invalid entity'});
    }

    console.log(`POST /api/data/${entity}`, req.body);
    const config = await prisma.entityConfig.findUnique({
        where: {name: entity},
        include: {dataSource: true, fields: true}
    });

    if (!config) {
        console.log(`Entity not found: ${entity}`);
        return res.status(404).json({error: 'Entity not found'});
    }

    try {
        const authCreate = await checkAuth(req, entity, 'create', config, req.body);
        if (!authCreate.allowed) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const ds = config.dataSource;
        console.log(`Using data source ${ds.name} (${ds.apiType}) at ${ds.apiUrl}`);
        if (ds.apiType === 'REST') {
            const response = await axios.post(validateUrl(ds.apiUrl), req.body);
            res.json(response.data);
        } else if (ds.apiType === 'GRAPHQL') {
            const ops = JSON.parse(ds.endpointsQueries || '{}');
            const queryStr = ops.create;
            if (!queryStr) throw new Error("Missing 'create' query configuration");

            const mutation = gql`${queryStr}`;

            const variables: Record<string, any> = {};
            config.fields.forEach((f: any) => {
                variables[f.name] = req.body[f.name];
            });

            console.log(`Sending GraphQL mutation to ${ds.apiUrl}:`, queryStr, 'with variables:', variables);
            const data = await request(validateUrl(ds.apiUrl), mutation, variables) as any;
            res.json(data[`create${entity.charAt(0).toUpperCase() + entity.slice(1)}`]);
        }
    } catch (error: any) {
        console.error(`Error in POST /api/data/${entity}:`, error.message);
        res.status(500).json({error: 'Failed to create data'});
    }
});

app.put('/api/data/:entity/:id', async (req, res) => {
    const {entity, id} = req.params;

    // Prevent path traversal
    if (entity.includes('/') || entity.includes('..')) {
        return res.status(400).json({error: 'Invalid entity'});
    }
    if (id.includes('/') || id.includes('..')) {
        return res.status(400).json({error: 'Invalid id'});
    }

    console.log(`PUT /api/data/${entity}/${id}`, req.body);
    const config = await prisma.entityConfig.findUnique({
        where: {name: entity},
        include: {dataSource: true, fields: true}
    });

    if (!config) {
        console.log(`Entity not found: ${entity}`);
        return res.status(404).json({error: 'Entity not found'});
    }

    try {
        const authEdit = await checkAuth(req, entity, 'edit', config, { id, ...req.body });
        if (!authEdit.allowed) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const ds = config.dataSource;
        console.log(`Using data source ${ds.name} (${ds.apiType}) at ${ds.apiUrl}`);
        if (ds.apiType === 'REST') {
            const response = await axios.put(validateUrl(`${ds.apiUrl}/${id}`), req.body);
            res.json(response.data);
        } else if (ds.apiType === 'GRAPHQL') {
            const ops = JSON.parse(ds.endpointsQueries || '{}');
            const queryStr = ops.update;
            if (!queryStr) throw new Error("Missing 'update' query configuration");

            const mutation = gql`${queryStr}`;

            const variables: Record<string, any> = {id};
            config.fields.forEach((f: any) => {
                if (req.body[f.name] !== undefined) {
                    variables[f.name] = req.body[f.name];
                }
            });

            console.log(`Sending GraphQL mutation to ${ds.apiUrl}:`, queryStr, 'with variables:', variables);
            const data = await request(validateUrl(ds.apiUrl), mutation, variables) as any;
            res.json(data[`update${entity.charAt(0).toUpperCase() + entity.slice(1)}`]);
        }
    } catch (error: any) {
        console.error(`Error in PUT /api/data/${entity}/${id}:`, error.message);
        res.status(500).json({error: 'Failed to update data'});
    }
});

app.delete('/api/data/:entity/:id', async (req, res) => {
    const {entity, id} = req.params;

    // Prevent path traversal
    if (entity.includes('/') || entity.includes('..')) {
        return res.status(400).json({error: 'Invalid entity'});
    }
    if (id.includes('/') || id.includes('..')) {
        return res.status(400).json({error: 'Invalid id'});
    }

    console.log(`DELETE /api/data/${entity}/${id}`);
    const config = await prisma.entityConfig.findUnique({
        where: {name: entity},
        include: {dataSource: true, fields: true}
    });

    if (!config) {
        console.log(`Entity not found: ${entity}`);
        return res.status(404).json({error: 'Entity not found'});
    }

    try {
        const authDelete = await checkAuth(req, entity, 'delete', config, { id });
        if (!authDelete.allowed) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const ds = config.dataSource;
        console.log(`Using data source ${ds.name} (${ds.apiType}) at ${ds.apiUrl}`);
        if (ds.apiType === 'REST') {
            await axios.delete(validateUrl(`${ds.apiUrl}/${id}`));
            res.json({success: true});
        } else if (ds.apiType === 'GRAPHQL') {
            const ops = JSON.parse(ds.endpointsQueries || '{}');
            const queryStr = ops.delete;
            if (!queryStr) throw new Error("Missing 'delete' query configuration");

            const mutation = gql`${queryStr}`;
            const variables = {id};

            console.log(`Sending GraphQL mutation to ${ds.apiUrl}:`, queryStr, 'with variables:', variables);
            await request(validateUrl(ds.apiUrl), mutation, variables);
            res.json({success: true});
        }
    } catch (error: any) {
        console.error(`Error in DELETE /api/data/${entity}/${id}:`, error.message);
        res.status(500).json({error: 'Failed to delete data'});
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend service running on port ${PORT}`);
});

import express from 'express';
import axios from 'axios';
import { validateUrl } from './utils.js';

export default function setupManagementRoutes(app: express.Express, prisma: any) {
    // Data Sources
    app.get('/api/data-sources', async (req, res) => {
        try {
            const ds = await prisma.dataSource.findMany();
            res.json(ds);
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    });

    app.post('/api/data-sources', async (req, res) => {
        try {
            if (req.body.apiUrl) {
                try {
                    validateUrl(req.body.apiUrl);
                } catch (err: any) {
                    if (err.message.includes('protocol')) {
                        return res.status(400).json({ error: 'Invalid URL protocol' });
                    }
                    throw err; // let outer catch handle invalid url format
                }
            }
            const ds = await prisma.dataSource.create({ data: req.body });
            res.json(ds);
        } catch (e: any) {
            if (e.name === 'TypeError' && e.message === 'Invalid URL') {
                return res.status(400).json({ error: 'Invalid URL format' });
            }
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    });

    app.put('/api/data-sources/:id', async (req, res) => {
        try {
            if (req.body.apiUrl) {
                try {
                    validateUrl(req.body.apiUrl);
                } catch (err: any) {
                    if (err.message.includes('protocol')) {
                        return res.status(400).json({ error: 'Invalid URL protocol' });
                    }
                    throw err; // let outer catch handle invalid url format
                }
            }
            const ds = await prisma.dataSource.update({
                where: { id: parseInt(req.params.id) },
                data: req.body
            });
            res.json(ds);
        } catch (e: any) {
            if (e.name === 'TypeError' && e.message === 'Invalid URL') {
                return res.status(400).json({ error: 'Invalid URL format' });
            }
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    });

    app.delete('/api/data-sources/:id', async (req, res) => {
        try {
            await prisma.dataSource.delete({ where: { id: parseInt(req.params.id) } });
            res.json({ success: true });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    });

    // Get config by ID
    app.get('/api/config/id/:id', async (req, res) => {
        try {
            const config = await prisma.entityConfig.findUnique({
                where: { id: parseInt(req.params.id) },
                include: { dataSource: true, fields: true, presets: true }
            });
            if (!config) {
                return res.status(404).json({ error: 'Configuration not found' });
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
        } catch (e: any) {
            res.status(500).json({ error: e.message });
        }
    });

    // Create a new config
    app.post('/api/config/new', async (req, res) => {
        const { name, dataSourceId, schemaName, fields, presets, defaultPresetId } = req.body;
        try {
            const config = await prisma.entityConfig.create({
                data: {
                    name,
                    dataSourceId,
                    schemaName,
                    fields: {
                        create: fields
                    },
                    presets: {
                        create: (presets || []).map((p: any) => ({
                            name: p.name,
                            gridTemplate: p.gridTemplate,
                            defaultValues: p.defaultValues ? JSON.stringify(p.defaultValues) : null
                        }))
                    }
                },
                include: { fields: true, presets: true }
            });

            let finalConfig = config;
            if (defaultPresetId) {
                // If an ID was explicitly provided, try to use it (unlikely on create though)
                finalConfig = await prisma.entityConfig.update({
                    where: { id: config.id },
                    data: { defaultPresetId },
                    include: { fields: true, presets: true }
                });
            } else if (config.presets.length > 0) {
                // Set the first preset as default
                finalConfig = await prisma.entityConfig.update({
                    where: { id: config.id },
                    data: { defaultPresetId: config.presets[0].id },
                    include: { fields: true, presets: true }
                });
            }

            res.json({
                ...finalConfig,
                presets: finalConfig.presets.map((p: any) => ({
                    ...p,
                    defaultValues: p.defaultValues ? JSON.parse(p.defaultValues) : undefined
                }))
            });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    });

    // Configs Update
    app.put('/api/config/:id', async (req, res) => {
        const { name, dataSourceId, schemaName, fields, presets, defaultPresetId } = req.body;
        const id = parseInt(req.params.id);

        try {
            await prisma.field.deleteMany({ where: { entityConfigId: id } });
            await prisma.preset.deleteMany({ where: { entityConfigId: id } });

            const config = await prisma.entityConfig.update({
                where: { id },
                data: {
                    name,
                    dataSourceId,
                    schemaName,
                    fields: {
                        create: fields
                    },
                    presets: {
                        create: (presets || []).map((p: any) => ({
                            name: p.name,
                            gridTemplate: p.gridTemplate,
                            defaultValues: p.defaultValues ? JSON.stringify(p.defaultValues) : null
                        }))
                    }
                },
                include: { fields: true, presets: true }
            });

            let newDefaultPresetId = null;
            if (defaultPresetId) {
                // Front end passed a default preset ID. It might be an old ID or just an index.
                // Actually, the simplest way is to match by name (since we recreate them).
                const selectedPresetName = presets.find((p: any) => p.id === defaultPresetId)?.name;
                if (selectedPresetName) {
                    newDefaultPresetId = config.presets.find((p: any) => p.name === selectedPresetName)?.id;
                }
            }
            if (!newDefaultPresetId && config.presets.length > 0) {
                 newDefaultPresetId = config.presets[0].id;
            }

            const finalConfig = await prisma.entityConfig.update({
                where: { id },
                data: { defaultPresetId: newDefaultPresetId },
                include: { fields: true, presets: true }
            });

            res.json({
                ...finalConfig,
                presets: finalConfig.presets.map((p: any) => ({
                    ...p,
                    defaultValues: p.defaultValues ? JSON.parse(p.defaultValues) : undefined
                }))
            });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    });

    app.delete('/api/config/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            await prisma.field.deleteMany({ where: { entityConfigId: id } });
            await prisma.preset.deleteMany({ where: { entityConfigId: id } });
            await prisma.entityConfig.delete({ where: { id } });
            res.json({ success: true });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    });

    // GraphQL Introspection proxy
    app.post('/api/introspect', async (req, res) => {
        const { url, headers } = req.body;
        try {
            if (url) {
                try {
                    validateUrl(url);
                } catch (err: any) {
                    if (err.message.includes('protocol')) {
                        return res.status(400).json({ error: 'Invalid URL protocol' });
                    }
                    throw err; // let outer catch handle invalid url format
                }
            }
            const query = `
              query IntrospectionQuery {
                __schema {
                  queryType { name }
                  mutationType { name }
                  subscriptionType { name }
                  types { ...FullType }
                  directives {
                    name
                    description
                    locations
                    args { ...InputValue }
                  }
                }
              }
              fragment FullType on __Type {
                kind
                name
                description
                fields(includeDeprecated: true) {
                  name
                  description
                  args { ...InputValue }
                  type { ...TypeRef }
                  isDeprecated
                  deprecationReason
                }
                inputFields { ...InputValue }
                interfaces { ...TypeRef }
                enumValues(includeDeprecated: true) {
                  name
                  description
                  isDeprecated
                  deprecationReason
                }
                possibleTypes { ...TypeRef }
              }
              fragment InputValue on __InputValue {
                name
                description
                type { ...TypeRef }
                defaultValue
              }
              fragment TypeRef on __Type {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                      ofType {
                        kind
                        name
                        ofType {
                          kind
                          name
                          ofType {
                            kind
                            name
                            ofType {
                              kind
                              name
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            `;
            let parsedHeaders = {};
            if (headers) {
                try { parsedHeaders = JSON.parse(headers); } catch (e) { console.warn("Invalid JSON in headers", e); }
            }
            const response = await axios.post(url, { query }, { headers: parsedHeaders, timeout: 5000 });
            res.json(response.data.data);
        } catch (e: any) {
            console.error(e.response?.data || e.message);
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    });
}

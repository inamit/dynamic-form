import { EntityConfigRepository } from '../repositories/entity-config.repository.js';
import { validateUrl } from '../utils.js';
import axios from 'axios';
import { request, gql } from 'graphql-request';

export class EntityConfigService {
    private configRepo: EntityConfigRepository;

    constructor() {
        this.configRepo = new EntityConfigRepository();
    }

    async getConfigById(id: number) {
        const config = await this.configRepo.getConfigById(id);
        if (!config) throw new Error('Config not found');
        return config;
    }

    async createConfig(data: any) {
        const { name, dataSourceId, schemaName, fields, presets, defaultPresetId, authView, authCreate, authEdit, authDelete, endpointsQueries } = data;

        const configData = {
            name,
            dataSourceId,
            schemaName,
            endpointsQueries,
            fields: { create: fields },
            presets: {
                create: (presets || []).map((p: any) => ({
                    name: p.name,
                    gridTemplate: p.gridTemplate,
                    defaultValues: p.defaultValues ? JSON.stringify(p.defaultValues) : null
                }))
            },
            authView, authCreate, authEdit, authDelete
        };

        const config = await this.configRepo.createConfig(configData);

        let newDefaultPresetId = null;
        if (defaultPresetId) {
            const selectedPresetName = presets.find((p: any) => p.id === defaultPresetId)?.name;
            if (selectedPresetName) {
                newDefaultPresetId = config.presets.find((p: any) => p.name === selectedPresetName)?.id;
            }
        }
        if (!newDefaultPresetId && config.presets.length > 0) {
            newDefaultPresetId = config.presets[0].id;
        }

        return await this.configRepo.updateConfigDefaultPresetId(config.id, newDefaultPresetId);
    }

    async updateConfig(id: number, data: any) {
        const { name, dataSourceId, schemaName, fields, presets, defaultPresetId, authView, authCreate, authEdit, authDelete, endpointsQueries } = data;

        const updateData = {
            name,
            dataSourceId,
            schemaName,
            endpointsQueries,
            fields: { create: fields },
            presets: {
                create: (presets || []).map((p: any) => ({
                    name: p.name,
                    gridTemplate: p.gridTemplate,
                    defaultValues: p.defaultValues ? JSON.stringify(p.defaultValues) : null
                }))
            },
            authView, authCreate, authEdit, authDelete
        };

        return await this.configRepo.updateConfigWithTransaction(id, updateData, defaultPresetId, presets || []);
    }

    async deleteConfig(id: number) {
        return await this.configRepo.deleteConfig(id);
    }

    async introspect(url: string, type: string) {
        if (!url) throw new Error("URL is required");
        let validatedUrl;
        validatedUrl = validateUrl(url);

        if (type === 'REST') {
            const res = await axios.get(validatedUrl);
            const firstItem = Array.isArray(res.data) ? res.data[0] : null;
            if (!firstItem) throw new Error("No data found to introspect");

            const fields = Object.keys(firstItem).map(k => {
                const val = firstItem[k];
                let ftype = 'text';
                if (typeof val === 'number') ftype = 'number';
                if (typeof val === 'boolean') ftype = 'checkbox';
                return { name: k, type: ftype, label: k.charAt(0).toUpperCase() + k.slice(1) };
            });
            return fields;
        } else if (type === 'GRAPHQL') {
            const query = gql`
                query IntrospectionQuery {
                    __schema {
                        types {
                            name
                            kind
                            fields {
                                name
                                type {
                                    name
                                    kind
                                    ofType {
                                        name
                                        kind
                                    }
                                }
                            }
                        }
                    }
                }
            `;
            const data = await request(validatedUrl, query) as any;
            return data.__schema.types.filter((t: any) => t.kind === 'OBJECT' && !t.name.startsWith('__'));
        } else {
            throw new Error("Invalid type");
        }
    }
}

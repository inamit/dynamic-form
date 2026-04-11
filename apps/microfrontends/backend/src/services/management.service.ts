import { ManagementRepository } from '../repositories/management.repository.js';
import { validateUrl } from '../utils.js';
import axios from 'axios';
import { request, gql } from 'graphql-request';

export class ManagementService {
    private managementRepo: ManagementRepository;

    constructor() {
        this.managementRepo = new ManagementRepository();
    }

    async getDataSources() {
        return await this.managementRepo.getDataSources();
    }

    async createDataSource(data: any) {
        if (data.apiUrl) {
            data.apiUrl = validateUrl(data.apiUrl);
        }
        return await this.managementRepo.createDataSource(data);
    }

    async updateDataSource(id: number, data: any) {
        if (data.apiUrl) {
            data.apiUrl = validateUrl(data.apiUrl);
        }
        return await this.managementRepo.updateDataSource(id, data);
    }

    async deleteDataSource(id: number) {
        return await this.managementRepo.deleteDataSource(id);
    }

    async getConfigById(id: number) {
        const config = await this.managementRepo.getConfigById(id);
        if (!config) throw new Error('Config not found');
        return config;
    }

    async createConfig(data: any) {
        const { name, dataSourceId, schemaName, fields, presets, defaultPresetId, authView, authCreate, authEdit, authDelete } = data;

        const configData = {
            name,
            dataSourceId,
            schemaName,
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

        const config = await this.managementRepo.createConfig(configData);

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

        return await this.managementRepo.updateConfigDefaultPresetId(config.id, newDefaultPresetId);
    }

    async updateConfig(id: number, data: any) {
        const { name, dataSourceId, schemaName, fields, presets, defaultPresetId, authView, authCreate, authEdit, authDelete } = data;

        const updateData = {
            name,
            dataSourceId,
            schemaName,
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

        return await this.managementRepo.updateConfigWithTransaction(id, updateData, defaultPresetId, presets || []);
    }

    async deleteConfig(id: number) {
        return await this.managementRepo.deleteConfig(id);
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

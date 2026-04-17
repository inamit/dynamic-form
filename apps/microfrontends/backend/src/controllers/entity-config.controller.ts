import { Request, Response } from 'express';
import { EntityConfigService } from '../services/entity-config.service.js';

export class EntityConfigController {
    private configService: EntityConfigService;

    constructor() {
        this.configService = new EntityConfigService();
    }

    getConfigById = async (req: Request, res: Response) => {
        try {
            const config = await this.configService.getConfigById(parseInt(req.params.id as string));
            res.json({
                ...config,
                presets: config.presets.map((p: any) => ({
                    ...p,
                    defaultValues: p.defaultValues ? JSON.parse(p.defaultValues) : undefined,
                    listSubFields: p.listSubFields ? JSON.parse(p.listSubFields) : undefined
                }))
            });
        } catch (e: any) {
            if (e.message === 'Config not found') {
                return res.status(404).json({ error: 'Configuration not found' });
            }
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    createConfig = async (req: Request, res: Response) => {
        try {
            const config = await this.configService.createConfig(req.body);
            res.json({
                ...config,
                presets: config.presets.map((p: any) => ({
                    ...p,
                    defaultValues: p.defaultValues ? JSON.parse(p.defaultValues) : undefined,
                    listSubFields: p.listSubFields ? JSON.parse(p.listSubFields) : undefined
                }))
            });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    updateConfig = async (req: Request, res: Response) => {
        try {
            const config = await this.configService.updateConfig(parseInt(req.params.id as string), req.body);
            res.json({
                ...config,
                presets: config.presets.map((p: any) => ({
                    ...p,
                    defaultValues: p.defaultValues ? JSON.parse(p.defaultValues) : undefined,
                    listSubFields: p.listSubFields ? JSON.parse(p.listSubFields) : undefined
                }))
            });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    deleteConfig = async (req: Request, res: Response) => {
        try {
            await this.configService.deleteConfig(parseInt(req.params.id as string));
            res.json({ success: true });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    introspect = async (req: Request, res: Response) => {
        try {
            const result = await this.configService.introspect(req.body.url, req.body.type);
            res.json(result);
        } catch (e: any) {
            if (e.message === 'Invalid URL format' || e.message.includes('Invalid URL')) {
                return res.status(400).json({ error: 'Invalid URL format' });
            }
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };
}

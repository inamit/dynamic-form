import { Request, Response } from 'express';
import { ManagementService } from '../services/management.service.js';

export class ManagementController {
    private managementService: ManagementService;

    constructor() {
        this.managementService = new ManagementService();
    }

    // --- Data Sources ---
    getDataSources = async (req: Request, res: Response) => {
        try {
            const ds = await this.managementService.getDataSources();
            res.json(ds);
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    createDataSource = async (req: Request, res: Response) => {
        try {
            const ds = await this.managementService.createDataSource(req.body);
            res.json(ds);
        } catch (e: any) {
            if (e.message === 'Invalid URL format' || e.message.includes('Invalid URL')) {
                return res.status(400).json({ error: 'Invalid URL format' });
            }
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    updateDataSource = async (req: Request, res: Response) => {
        try {
            const ds = await this.managementService.updateDataSource(parseInt(req.params.id as string), req.body);
            res.json(ds);
        } catch (e: any) {
            if (e.message === 'Invalid URL format' || e.message.includes('Invalid URL')) {
                return res.status(400).json({ error: 'Invalid URL format' });
            }
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    deleteDataSource = async (req: Request, res: Response) => {
        try {
            await this.managementService.deleteDataSource(parseInt(req.params.id as string));
            res.json({ success: true });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    // --- Configs ---
    getConfigById = async (req: Request, res: Response) => {
        try {
            const config = await this.managementService.getConfigById(parseInt(req.params.id as string));
            res.json({
                ...config,
                presets: config.presets.map((p: any) => ({
                    ...p,
                    defaultValues: p.defaultValues ? JSON.parse(p.defaultValues) : undefined
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
            const config = await this.managementService.createConfig(req.body);
            res.json({
                ...config,
                presets: config.presets.map((p: any) => ({
                    ...p,
                    defaultValues: p.defaultValues ? JSON.parse(p.defaultValues) : undefined
                }))
            });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    updateConfig = async (req: Request, res: Response) => {
        try {
            const config = await this.managementService.updateConfig(parseInt(req.params.id as string), req.body);
            res.json({
                ...config,
                presets: config.presets.map((p: any) => ({
                    ...p,
                    defaultValues: p.defaultValues ? JSON.parse(p.defaultValues) : undefined
                }))
            });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    deleteConfig = async (req: Request, res: Response) => {
        try {
            await this.managementService.deleteConfig(parseInt(req.params.id as string));
            res.json({ success: true });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    // --- Introspect ---
    introspect = async (req: Request, res: Response) => {
        try {
            const result = await this.managementService.introspect(req.body.url, req.body.type);
            res.json(result);
        } catch (e: any) {
            if (e.message === 'Invalid URL format' || e.message.includes('Invalid URL')) {
                return res.status(400).json({ error: 'Invalid URL format' });
            }
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };
}

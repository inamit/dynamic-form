import { Request, Response } from 'express';
import { DataSourceService } from '../services/data-source.service.js';

export class DataSourceController {
    private dataSourceService: DataSourceService;

    constructor() {
        this.dataSourceService = new DataSourceService();
    }

    getDataSources = async (req: Request, res: Response) => {
        try {
            const ds = await this.dataSourceService.getDataSources();
            res.json(ds);
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };

    createDataSource = async (req: Request, res: Response) => {
        try {
            const ds = await this.dataSourceService.createDataSource(req.body);
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
            const ds = await this.dataSourceService.updateDataSource(parseInt(req.params.id as string), req.body);
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
            await this.dataSourceService.deleteDataSource(parseInt(req.params.id as string));
            res.json({ success: true });
        } catch (e: any) {
            res.status(500).json({ error: e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message });
        }
    };
}

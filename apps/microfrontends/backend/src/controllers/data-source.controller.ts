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
            console.error('Error fetching data sources:', e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message);
            res.status(500).json({ error: 'An internal server error occurred' });
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
            console.error('Error creating data source:', e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message);
            res.status(500).json({ error: 'An internal server error occurred' });
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
            console.error(`Error updating data source ${req.params.id}:`, e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message);
            res.status(500).json({ error: 'An internal server error occurred' });
        }
    };

    deleteDataSource = async (req: Request, res: Response) => {
        try {
            await this.dataSourceService.deleteDataSource(parseInt(req.params.id as string));
            res.json({ success: true });
        } catch (e: any) {
            console.error(`Error deleting data source ${req.params.id}:`, e.response?.data?.errors ? JSON.stringify(e.response.data.errors) : e.message);
            res.status(500).json({ error: 'An internal server error occurred' });
        }
    };
}

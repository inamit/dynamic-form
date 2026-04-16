import { Request, Response } from 'express';
import { ConfigService } from '../services/config.service.js';
import { isValidParam } from '../utils.js';

export class ConfigController {
    private configService: ConfigService;

    constructor() {
        this.configService = new ConfigService();
    }

    getAllConfigs = async (req: Request, res: Response) => {
        try {
            const configs = await this.configService.getAllConfigs();
            res.json(configs);
        } catch (error) {
            console.error('Error in GET /api/config:', error);
            res.status(500).json({ error: 'Failed to fetch configurations' });
        }
    };

    getConfigByName = async (req: Request, res: Response) => {
        try {
            const name = req.params.name as string;
            if (!isValidParam(name)) {
                return res.status(400).json({ error: 'Invalid name parameter' });
            }
            const config = await this.configService.getConfigByName(name);
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
        } catch (error) {
            console.error(`Error in GET /api/config/${req.params.name}:`, error);
            res.status(500).json({ error: 'Failed to fetch configuration' });
        }
    };
}

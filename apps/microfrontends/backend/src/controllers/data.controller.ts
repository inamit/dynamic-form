import { Request, Response } from 'express';
import { DataService } from '../services/data.service.js';
import { isValidParam } from '../utils.js';

export class DataController {
    private dataService: DataService;

    constructor() {
        this.dataService = new DataService();
    }

    getData = async (req: Request, res: Response) => {
        try {
            const entity = req.params.entity as string;
            if (!isValidParam(entity)) {
                return res.status(400).json({ error: 'Invalid entity' });
            }

            const { id: userId } = (req as any).user;
            const origin = (req as any).origin;

            const data = await this.dataService.getData(entity, userId, origin);
            res.json(data);
        } catch (error: any) {
            if (error.message === 'Entity not found') {
                return res.status(404).json({ error: error.message });
            }

            console.error(`Error in GET /api/data/${req.params.entity}:`, error.message);
            res.status(500).json({ error: 'Failed to create data' });
            res.status(500).json({ error: 'Failed to fetch data' });
        }
    };
    getDataById = async (req: Request, res: Response) => {
        try {
            const entity = req.params.entity as string;
            const id = req.params.id as string;
            if (!isValidParam(entity) || !isValidParam(id)) {
                return res.status(400).json({ error: 'Invalid parameters' });
            }

            const { id: userId } = (req as any).user;
            const origin = (req as any).origin;

            const data = await this.dataService.getDataById(entity, id, userId, origin);
            res.json(data);
        } catch (error: any) {
            if (error.message === 'Entity not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Forbidden') {
                return res.status(403).json({ error: error.message });
            }

            console.error(`Error in GET /api/data/${req.params.entity}/${req.params.id}:`, error.message);
            res.status(500).json({ error: 'Failed to fetch data' });
        }
    };

    createData = async (req: Request, res: Response) => {
        try {
            const entity = req.params.entity as string;
            if (!isValidParam(entity)) {
                return res.status(400).json({ error: 'Invalid entity' });
            }

            const { id: userId } = (req as any).user;
            const origin = (req as any).origin;

            const data = await this.dataService.createData(entity, req.body, userId, origin);
            res.json(data);
        } catch (error: any) {
            if (error.message === 'Entity not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Forbidden') {
                return res.status(403).json({ error: error.message });
            }

            console.error(`Error in POST /api/data/${req.params.entity}:`, error.message);
            res.status(500).json({ error: 'Failed to create data' });
        }
    };

    updateData = async (req: Request, res: Response) => {
        try {
            const entity = req.params.entity as string;
            const id = req.params.id as string;
            if (!isValidParam(entity) || !isValidParam(id)) {
                return res.status(400).json({ error: 'Invalid parameters' });
            }

            const { id: userId } = (req as any).user;
            const origin = (req as any).origin;

            const data = await this.dataService.updateData(entity, id, req.body, userId, origin);
            res.json(data);
        } catch (error: any) {
            if (error.message === 'Entity not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Forbidden') {
                return res.status(403).json({ error: error.message });
            }

            console.error(`Error in PUT /api/data/${req.params.entity}/${req.params.id}:`, error.message);
            res.status(500).json({ error: 'Failed to update data' });
        }
    };

    deleteData = async (req: Request, res: Response) => {
        try {
            const entity = req.params.entity as string;
            const id = req.params.id as string;
            if (!isValidParam(entity) || !isValidParam(id)) {
                return res.status(400).json({ error: 'Invalid parameters' });
            }

            const { id: userId } = (req as any).user;
            const origin = (req as any).origin;

            const data = await this.dataService.deleteData(entity, id, userId, origin);
            res.json(data);
        } catch (error: any) {
            if (error.message === 'Entity not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Forbidden') {
                return res.status(403).json({ error: error.message });
            }

            console.error(`Error in DELETE /api/data/${req.params.entity}/${req.params.id}:`, error.message);
            res.status(500).json({ error: 'Failed to delete data' });
        }
    };
}

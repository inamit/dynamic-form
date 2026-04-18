import { Request, Response } from 'express';
import { SchemaService } from '../services/schema.service.js';
import { isValidParam } from '../utils.js';

export class SchemaController {
    private schemaService: SchemaService;

    constructor() {
        this.schemaService = new SchemaService();
    }

    getSchemas = async (req: Request, res: Response) => {
        try {
            const schemas = await this.schemaService.getSchemas();
            res.json(schemas);
        } catch (error: any) {
            if (error.message === 'Schema configuration not found') {
                return res.status(404).json({ error: error.message });
            }
            console.error(`Error in GET /api/schemas:`, error.message);
            res.status(500).json({ error: 'Failed to fetch schemas list' });
        }
    };

    getSchema = async (req: Request, res: Response) => {
        try {
            const entityName = req.params.entityName as string;
            if (!isValidParam(entityName)) {
                return res.status(400).json({ error: 'Invalid entityName' });
            }

            const schema = await this.schemaService.getSchema(entityName);
            res.json(schema);
        } catch (error: any) {
             if (error.message === 'Schema configuration not found') {
                return res.status(404).json({ error: error.message });
            }
            console.error(`Error in GET /api/schema/${req.params.entityName}:`, error.message);
            res.status(500).json({ error: 'Failed to fetch schema' });
        }
    };

    getEnum = async (req: Request, res: Response) => {
        try {
            const enumName = req.params.enumName as string;
            if (!isValidParam(enumName)) {
                return res.status(400).json({ error: 'Invalid enumName' });
            }

            const enumData = await this.schemaService.getEnum(enumName);
            res.json(enumData);
        } catch (error: any) {
            if (error.message === 'Enum configuration not found') {
                return res.status(404).json({ error: error.message });
            }
            console.error(`Error in GET /api/enums/${req.params.enumName}:`, error.message);
            res.status(500).json({ error: 'Failed to fetch enum' });
        }
    };

    getEnums = async (req: Request, res: Response) => {
        try {
            const enumData = await this.schemaService.getAllEnums();
            res.json(enumData);
        } catch (error: any) {
            if (error.message === 'Enum configuration not found') {
                return res.status(404).json({ error: error.message });
            }
            console.error(`Error in GET /api/enums:`, error.message);
            res.status(500).json({ error: 'Failed to fetch enum' });
        }
    }
}

import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { SchemaController } from '../controllers/schema.controller.js';

jest.unstable_mockModule('../services/schema.service.js', () => ({
    SchemaService: jest.fn()
}));

describe('SchemaController', () => {
    let app: express.Express;
    let mockSchemaService: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        mockSchemaService = {
            getSchemas: jest.fn(),
            getSchema: jest.fn(),
            getEnum: jest.fn(),
        } as any;

        const controller = new SchemaController();
        (controller as any).schemaService = mockSchemaService;

        app.get('/schemas', controller.getSchemas);
        app.get('/schema/:entityName', controller.getSchema);
        app.get('/enums/:enumName', controller.getEnum);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /schemas', () => {
        it('should return schemas list successfully', async () => {
            const mockSchemas = { users: { type: 'object' } };
            mockSchemaService.getSchemas.mockResolvedValue(mockSchemas);

            const response = await request(app).get('/schemas');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSchemas);
            expect(mockSchemaService.getSchemas).toHaveBeenCalledTimes(1);
        });

        it('should return 404 if schema configuration not found', async () => {
            mockSchemaService.getSchemas.mockRejectedValue(new Error('Schema configuration not found'));

            const response = await request(app).get('/schemas');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Schema configuration not found' });
        });
    });

    describe('GET /schema/:entityName', () => {
        it('should return 400 for invalid entityName', async () => {
            const response = await request(app).get('/schema/invalid..entity');
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Invalid entityName' });
            expect(mockSchemaService.getSchema).not.toHaveBeenCalled();
        });

        it('should return schema for valid entityName', async () => {
            const mockSchema = { type: 'object', properties: {} };
            mockSchemaService.getSchema.mockResolvedValue(mockSchema);

            const response = await request(app).get('/schema/users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockSchema);
            expect(mockSchemaService.getSchema).toHaveBeenCalledWith('users');
        });
    });
});

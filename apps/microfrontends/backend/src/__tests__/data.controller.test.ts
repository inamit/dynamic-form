import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { DataController } from '../controllers/data.controller.js';

describe('DataController', () => {
    let app: express.Express;
    let mockDataService: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        app.use((req, res, next) => {
            (req as any).user = { id: 'test_user' };
            (req as any).origin = 'http://test-origin';
            next();
        });

        mockDataService = {
            getEntityAbilities: jest.fn(),
            getData: jest.fn(),
            getDataById: jest.fn(),
            createData: jest.fn(),
            updateData: jest.fn(),
            deleteData: jest.fn(),
        };

        const controller = new DataController();
        (controller as any).dataService = mockDataService;

        app.get('/data/:entity/abilities', controller.getAbilities);
        app.get('/data/:entity', controller.getData);
        app.get('/data/:entity/:id', controller.getDataById);
        app.post('/data/:entity', controller.createData);
        app.put('/data/:entity/:id', controller.updateData);
        app.delete('/data/:entity/:id', controller.deleteData);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /data/:entity/abilities', () => {
        it('should return 400 if entity is invalid path', async () => {
            const response = await request(app).get('/data/invalid..path/abilities');
            expect(response.status).toBe(400);
        });

        it('should return abilities', async () => {
            const mockAbilities = { canView: true, canCreate: false, canEdit: false, canDelete: false };
            mockDataService.getEntityAbilities.mockResolvedValue(mockAbilities);

            const response = await request(app).get('/data/testEntity/abilities');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAbilities);
        });
    });

    describe('GET /data/:entity', () => {
        it('should return data array', async () => {
            const mockData = [{ id: '1', name: 'Test' }];
            mockDataService.getData.mockResolvedValue(mockData);

            const response = await request(app).get('/data/testEntity');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockData);
        });

        it('should return 404 if entity not found', async () => {
            mockDataService.getData.mockRejectedValue(new Error('Entity not found'));

            const response = await request(app).get('/data/testEntity');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Entity not found' });
        });
    });

    describe('POST /data/:entity', () => {
        it('should create and return data', async () => {
            const mockData = { id: '1', name: 'New Test' };
            mockDataService.createData.mockResolvedValue(mockData);

            const response = await request(app).post('/data/testEntity').send({ name: 'New Test' });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockData);
        });

        it('should return 403 if forbidden', async () => {
            mockDataService.createData.mockRejectedValue(new Error('Forbidden'));

            const response = await request(app).post('/data/testEntity').send({ name: 'New Test' });
            expect(response.status).toBe(403);
            expect(response.body).toEqual({ error: 'Forbidden' });
        });
    });
});

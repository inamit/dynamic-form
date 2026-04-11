import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { ManagementController } from '../controllers/management.controller.js';

describe('ManagementController', () => {
    let app: express.Express;
    let mockManagementService: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        mockManagementService = {
            getDataSources: jest.fn(),
            createDataSource: jest.fn(),
            updateDataSource: jest.fn(),
            deleteDataSource: jest.fn(),
            getConfigById: jest.fn(),
            createConfig: jest.fn(),
            updateConfig: jest.fn(),
            deleteConfig: jest.fn(),
            introspect: jest.fn()
        };

        const controller = new ManagementController();
        (controller as any).managementService = mockManagementService;

        app.get('/data-sources', controller.getDataSources);
        app.post('/data-sources', controller.createDataSource);
        app.put('/data-sources/:id', controller.updateDataSource);
        app.delete('/data-sources/:id', controller.deleteDataSource);

        app.get('/config/id/:id', controller.getConfigById);
        app.post('/config/new', controller.createConfig);
        app.put('/config/:id', controller.updateConfig);
        app.delete('/config/:id', controller.deleteConfig);

        app.post('/introspect', controller.introspect);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /data-sources', () => {
        it('should return all data sources', async () => {
            const mockDataSources = [{ id: 1, name: 'ds1', apiUrl: 'http://test' }];
            mockManagementService.getDataSources.mockResolvedValue(mockDataSources);

            const response = await request(app).get('/data-sources');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDataSources);
        });
    });

    describe('POST /data-sources', () => {
        it('should create data source', async () => {
            const mockDs = { id: 1, name: 'ds1', apiUrl: 'http://test' };
            mockManagementService.createDataSource.mockResolvedValue(mockDs);

            const response = await request(app).post('/data-sources').send({ name: 'ds1', apiUrl: 'http://test' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDs);
        });

        it('should return 400 for invalid url', async () => {
            mockManagementService.createDataSource.mockRejectedValue(new Error('Invalid URL format'));

            const response = await request(app).post('/data-sources').send({ name: 'ds1', apiUrl: 'invalid-url' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Invalid URL format' });
        });
    });

    describe('GET /config/id/:id', () => {
        it('should return config by id', async () => {
            const mockConfig = { id: 1, presets: [{ defaultValues: '{"test":"val"}' }] };
            mockManagementService.getConfigById.mockResolvedValue(mockConfig);

            const response = await request(app).get('/config/id/1');

            expect(response.status).toBe(200);
            expect(response.body.presets[0].defaultValues).toEqual({ test: 'val' });
        });
    });
});

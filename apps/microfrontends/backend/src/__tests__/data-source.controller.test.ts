import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { DataSourceController } from '../controllers/data-source.controller.js';

describe('DataSourceController', () => {
    let app: express.Express;
    let mockDataSourceService: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        mockDataSourceService = {
            getDataSources: jest.fn(),
            createDataSource: jest.fn(),
            updateDataSource: jest.fn(),
            deleteDataSource: jest.fn()
        };

        const controller = new DataSourceController();
        (controller as any).dataSourceService = mockDataSourceService;

        app.get('/data-sources', controller.getDataSources);
        app.post('/data-sources', controller.createDataSource);
        app.put('/data-sources/:id', controller.updateDataSource);
        app.delete('/data-sources/:id', controller.deleteDataSource);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /data-sources', () => {
        it('should return all data sources', async () => {
            const mockDataSources = [{ id: 1, name: 'ds1', apiUrl: 'http://test' }];
            mockDataSourceService.getDataSources.mockResolvedValue(mockDataSources);

            const response = await request(app).get('/data-sources');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDataSources);
        });
    });

    describe('POST /data-sources', () => {
        it('should create data source', async () => {
            const mockDs = { id: 1, name: 'ds1', apiUrl: 'http://test' };
            mockDataSourceService.createDataSource.mockResolvedValue(mockDs);

            const response = await request(app).post('/data-sources').send({ name: 'ds1', apiUrl: 'http://test' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDs);
        });

        it('should return 400 for invalid url', async () => {
            mockDataSourceService.createDataSource.mockRejectedValue(new Error('Invalid URL format'));

            const response = await request(app).post('/data-sources').send({ name: 'ds1', apiUrl: 'invalid-url' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Invalid URL format' });
        });
    });
});

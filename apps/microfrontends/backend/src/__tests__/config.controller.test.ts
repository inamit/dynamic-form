import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { ConfigController } from '../controllers/config.controller.js';

describe('ConfigController', () => {
    let app: express.Express;
    let mockConfigService: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        mockConfigService = {
            getAllConfigs: jest.fn(),
            getConfigByName: jest.fn()
        };

        const controller = new ConfigController();
        (controller as any).configService = mockConfigService;

        app.get('/config', controller.getAllConfigs);
        app.get('/config/:name', controller.getConfigByName);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /config', () => {
        it('should return all configs', async () => {
            const mockConfigs = [{ name: 'testConfig', apiUrl: 'http://test' }];
            mockConfigService.getAllConfigs.mockResolvedValue(mockConfigs);

            const response = await request(app).get('/config');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockConfigs);
        });
    });

    describe('GET /config/:name', () => {
        it('should return config by name', async () => {
            const mockConfig = { name: 'testConfig', dataSource: { apiUrl: 'http://test', apiType: 'REST' } };
            mockConfigService.getConfigByName.mockResolvedValue(mockConfig);

            const response = await request(app).get('/config/testConfig');

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('testConfig');
            expect(response.body.apiUrl).toBe('http://test');
        });

        it('should return 404 if config not found', async () => {
            mockConfigService.getConfigByName.mockResolvedValue(null);

            const response = await request(app).get('/config/nonexistent');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Configuration not found' });
        });
    });
});

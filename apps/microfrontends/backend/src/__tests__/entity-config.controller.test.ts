import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { EntityConfigController } from '../controllers/entity-config.controller.js';

describe('EntityConfigController', () => {
    let app: express.Express;
    let mockEntityConfigService: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        mockEntityConfigService = {
            getConfigById: jest.fn(),
            createConfig: jest.fn(),
            updateConfig: jest.fn(),
            deleteConfig: jest.fn(),
            introspect: jest.fn()
        };

        const controller = new EntityConfigController();
        (controller as any).configService = mockEntityConfigService;

        app.get('/config/id/:id', controller.getConfigById);
        app.post('/config/new', controller.createConfig);
        app.put('/config/:id', controller.updateConfig);
        app.delete('/config/:id', controller.deleteConfig);
        app.post('/introspect', controller.introspect);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /config/id/:id', () => {
        it('should return config by id', async () => {
            const mockConfig = { id: 1, presets: [{ defaultValues: '{"test":"val"}' }] };
            mockEntityConfigService.getConfigById.mockResolvedValue(mockConfig);

            const response = await request(app).get('/config/id/1');

            expect(response.status).toBe(200);
            expect(response.body.presets[0].defaultValues).toEqual({ test: 'val' });
        });
    });
});

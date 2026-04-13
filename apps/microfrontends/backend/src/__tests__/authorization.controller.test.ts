import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { AuthorizationController } from '../controllers/authorization.controller.js';

jest.unstable_mockModule('../services/authorization.service.js', () => ({
    AuthorizationService: jest.fn()
}));

describe('AuthorizationController', () => {
    let app: express.Express;
    let mockAuthorizationService: any;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        app.use((req, res, next) => {
            (req as any).user = { id: 'test_user' };
            (req as any).origin = 'http://test-origin';
            next();
        });

        mockAuthorizationService = {
            getEntityAbilities: jest.fn()
        };

        const controller = new AuthorizationController();
        (controller as any).authorizationService = mockAuthorizationService;

        app.get('/data/:entity/abilities', controller.getAbilities);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /data/:entity/abilities', () => {
        it('should return 400 if entity is invalid path', async () => {
            const response = await request(app).get('/data/invalid..path/abilities');
            expect(response.status).toBe(400);
        });

        it('should return 400 if entity contains URL-encoded path traversal characters', async () => {
            const response = await request(app).get('/data/%2e%2e%2fetc%2fpasswd/abilities');
            expect(response.status).toBe(400);
        });

        it('should return abilities', async () => {
            const mockAbilities = { canView: true, canCreate: false, canEdit: false, canDelete: false };
            mockAuthorizationService.getEntityAbilities.mockResolvedValue(mockAbilities);

            const response = await request(app).get('/data/testEntity/abilities');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockAbilities);
        });
    });
});

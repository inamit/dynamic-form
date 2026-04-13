import { Request, Response } from 'express';
import { AuthorizationService } from '../services/authorization.service.js';
import { isValidParam } from '../utils.js';

export class AuthorizationController {
    private authorizationService: AuthorizationService;

    constructor() {
        this.authorizationService = new AuthorizationService();
    }

    getAbilities = async (req: Request, res: Response) => {
        try {
            const entity = req.params.entity as string;
            if (!isValidParam(entity)) {
                return res.status(400).json({ error: 'Invalid entity' });
            }

            const { id: userId } = (req as any).user;
            const origin = (req as any).origin;

            const abilities = await this.authorizationService.getEntityAbilities(entity, userId, origin);
            res.json(abilities);
        } catch (error: any) {
            if (error.message === 'Entity not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to fetch abilities' });
        }
    };
}

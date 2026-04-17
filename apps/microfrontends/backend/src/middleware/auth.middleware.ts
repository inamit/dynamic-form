import { Request, Response, NextFunction } from 'express';
import { OrchestratorService } from '../services/orchestrator.service.js';

export function extractUser(req: Request, res: Response, next: NextFunction) {
    let userId = req.cookies.jwt_user_id || 'anonymous';
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        if (token) userId = 'user_from_token'; // mock decoding
    }
    (req as any).user = { id: userId };
    (req as any).origin = req.headers.origin || 'http://localhost:5001';
    next();
}

export async function requireManagementAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as any).user?.id || 'anonymous';
        const origin = (req as any).origin || 'http://localhost:5001';

        let ability = 'view';
        if (req.method === 'POST') ability = 'create';
        if (req.method === 'PUT' || req.method === 'PATCH') ability = 'edit';
        if (req.method === 'DELETE') ability = 'delete';

        const auth = await OrchestratorService.checkAuth(userId, origin, 'management', ability, {});
        if (!auth.allowed) {
            return res.status(403).json({ error: 'Forbidden: Insufficient privileges for management operations' });
        }
        next();
    } catch (error) {
        next(error);
    }
}

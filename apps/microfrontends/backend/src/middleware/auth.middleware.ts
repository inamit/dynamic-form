import { Request, Response, NextFunction } from 'express';

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

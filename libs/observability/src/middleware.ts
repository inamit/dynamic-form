import { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';
import { observeRequest } from './metrics.js';

export const observabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const latency_ms = Date.now() - start;
    const { statusCode } = res;

    // Attempt to get user/org context if available (e.g. set by extractUser middleware)
    const user = (req as any).user;
    const user_id = user?.id;
    const org_id = user?.orgId;

    // Record Metrics
    observeRequest(req.method, req.route?.path || req.path, statusCode, latency_ms);

    // Canonical Log Line
    logger.info('HTTP Request Lifecycle Completed', {
      latency_ms,
      status_code: statusCode,
      path: req.originalUrl || req.path,
      method: req.method,
      user_id,
      org_id
    });
  });

  next();
};

export const globalErrorInterceptor = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;

  if (statusCode >= 500) {
    const user = (req as any).user;
    logger.error('Unhandled Server Error', {
      error: err.message,
      stack: err.stack,
      status_code: statusCode,
      path: req.originalUrl || req.path,
      method: req.method,
      user_id: user?.id,
      body: req.body,
      query: req.query,
      params: req.params,
    });
  }

  res.status(statusCode).json({
    error: err.message || 'Internal Server Error'
  });
};

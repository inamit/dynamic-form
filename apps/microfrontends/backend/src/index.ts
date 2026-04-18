import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initTracing, observabilityMiddleware, globalErrorInterceptor, getMetricsHandler } from '@myorg/observability';
initTracing('backend-service');
import { getPrisma } from './db/prisma.js';
import apiRoutes from './routes/index.js';
import managementRoutes from './routes/management.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(observabilityMiddleware);

app.get('/metrics', async (req, res) => {

    getMetricsHandler(req, res);
});

// Initialize Prisma
getPrisma();

// Setup standard API routes
app.use('/api', apiRoutes);

// Setup management routes
app.use('/api', managementRoutes);

app.use(globalErrorInterceptor);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;

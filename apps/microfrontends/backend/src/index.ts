import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getPrisma } from './db/prisma.js';
import apiRoutes from './routes/index.js';
import managementRoutes from './routes/management.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Initialize Prisma
getPrisma();

// Setup standard API routes
app.use('/api', apiRoutes);

// Setup management routes
app.use('/api', managementRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

export default app;

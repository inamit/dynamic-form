import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getPrisma } from './db/prisma.js';
import apiRoutes from './routes/index.js';
import managementRoutes from './routes/management.routes.js';

const app = express();


const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
    : ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5001', 'http://localhost:5002', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
    origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

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

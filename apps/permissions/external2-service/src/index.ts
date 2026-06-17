import { initTracing, observabilityMiddleware, globalErrorInterceptor, getMetricsHandler } from '@myorg/observability';
initTracing('external2-service');
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(observabilityMiddleware);

app.get('/metrics', async (req, res) => {

    getMetricsHandler(req, res);
});

app.post('/api/check', (req, res) => {
    // External2 Mock Logic
    console.log('External2 check received:', req.body);

    // For testing purposes, we'll allow everything.
    // In reality, this would check some other system.
    res.json({ allowed: true });
});

app.use(globalErrorInterceptor);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`External2 mock service running on port ${PORT}`);
});

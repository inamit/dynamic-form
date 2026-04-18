import { initTracing, observabilityMiddleware, globalErrorInterceptor, getMetricsHandler } from '@myorg/observability';
initTracing('external1-service');
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
    // External1 Mock Logic
    console.log('External1 check received:', req.body);

    // For testing purposes, we'll allow everything.
    // In reality, this would check some external policy engine.
    res.json({ allowed: true });
});

app.use(globalErrorInterceptor);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`External1 mock service running on port ${PORT}`);
});

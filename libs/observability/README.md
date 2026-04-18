# Observability Library

This library provides OpenTelemetry tracing, Prometheus metrics with exemplars, and Splunk-compatible structured logging for backend microservices.

## Usage

In your main entrypoint (`index.ts`):

```ts
import { initTracing, observabilityMiddleware, globalErrorInterceptor, metricsRegister } from '@myorg/observability';
// IMPORTANT: initTracing must be called before other imports like express!
initTracing('my-service-name');

import express from 'express';

const app = express();

app.use(observabilityMiddleware);

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
});

// ... your routes ...

app.use(globalErrorInterceptor);
```

## Features

- **Automated Instrumentation:** HTTP, Express, and Prisma queries are automatically traced.
- **Canonical Log Line:** Outputs a structured JSON log at the end of each HTTP request including trace_id, span_id, latency_ms, status_code, path, and method.
- **Metrics Correlation:** Automatically injects the trace_id as a Prometheus exemplar into the HTTP request duration metric (`http_request_duration_ms`).
- **Standardized Error Handling:** global error interceptor that logs the full stack trace and request context.

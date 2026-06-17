import { metrics, ValueType } from '@opentelemetry/api';
import { metricExporter } from './tracer.js';
import { getTraceContext } from './tracer.js';

const meter = metrics.getMeter('http-metrics');

export const httpRequestDurationHistogram = meter.createHistogram('http_request_duration_ms', {
  description: 'Duration of HTTP requests in ms',
  unit: 'ms',
  valueType: ValueType.DOUBLE,
});

export const observeRequest = (method: string, route: string, code: number, durationMs: number) => {
  const labels = { method, route, code: code.toString() };
  httpRequestDurationHistogram.record(durationMs, labels);
};

export const getMetricsHandler = async (req: any, res: any) => {
  if (metricExporter) {
    try {
      const data = await metricExporter.getMetricsRequestHandler(req, res);
      return data;
    } catch(e) {
      res.status(500).send('Error getting metrics');
    }
  } else {
    res.status(404).send('Metrics exporter not initialized');
  }
};

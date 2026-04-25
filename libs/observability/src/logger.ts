import winston from 'winston';
import { getTraceContext } from './tracer.js';

const otelFormat = winston.format((info) => {
  const { traceId, spanId } = getTraceContext();
  if (traceId) info.trace_id = traceId;
  if (spanId) info.span_id = spanId;
  return info;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    otelFormat(),
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ],
});

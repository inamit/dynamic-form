import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { trace, context } from '@opentelemetry/api';

let sdk: NodeSDK | null = null;
export let metricExporter: PrometheusExporter | null = null;

export const initTracing = (serviceName: string) => {
  if (sdk) return;

  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTLP_TRACE_URL || 'http://localhost:4318/v1/traces',
  });

  // Use PrometheusExporter to expose an endpoint with exemplars natively via OpenTelemetry
  metricExporter = new PrometheusExporter({
    preventServerStart: true,
  });

  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    traceExporter,
    metricReader: metricExporter,
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
      new PrismaInstrumentation(),
    ],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk?.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
};

export const getTraceContext = () => {
  const activeContext = context.active();
  const span = trace.getSpan(activeContext);
  if (span) {
    const { traceId, spanId } = span.spanContext();
    return { traceId, spanId };
  }
  return { traceId: undefined, spanId: undefined };
};

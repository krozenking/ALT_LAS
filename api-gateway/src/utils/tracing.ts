import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // optional - default url is http://localhost:4318/v1/traces
    // url: "<your-otlp-endpoint>/v1/traces",
    // optional - collection of custom headers to be sent with each request, e.g. api key
    // headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      // optional - default url is http://localhost:4318/v1/metrics
      // url: "<your-otlp-endpoint>/v1/metrics",
      // optional - collection of custom headers to be sent with each request, e.g. api key
      // headers: {},
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

export const startOpenTelemetry = async () => {
  try {
    await sdk.start();
    console.log("OpenTelemetry SDK started successfully.");

    // Gracefully shut down the SDK on process exit
    process.on("SIGTERM", () => {
      sdk.shutdown()
        .then(() => console.log("OpenTelemetry SDK shut down successfully."))
        .catch((error) => console.error("Error shutting down OpenTelemetry SDK:", error))
        .finally(() => process.exit(0));
    });
    process.on("SIGINT", () => {
      sdk.shutdown()
        .then(() => console.log("OpenTelemetry SDK shut down successfully."))
        .catch((error) => console.error("Error shutting down OpenTelemetry SDK:", error))
        .finally(() => process.exit(0));
    });

  } catch (error) {
    console.error("Error starting OpenTelemetry SDK:", error);
  }
};


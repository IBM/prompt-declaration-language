

# Gathering telemetry for PDL programs

PDL includes experimental support for gathering trace telemetry.  This can
be used for debugging or performance analysis.

##  Installing prerequisites

The OpenTelemetry client libraries are not installed by default.
To install them, use

```bash
pip install opentelemetry-api opentelemetry-sdk opentelemetry-exporter-otlp-proto-http opentelemetry-exporter-otlp-proto-grpc
```

## Installing an OpenTelemetry collector

PDL should work with any OpenTelemetry collector including [the official
collector](https://opentelemetry.io/docs/collector/installation/) or [Jaeger](https://www.jaegertracing.io/).

For example, start the all-in-one Jaeger using

```bash
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_GRPC_HOST_PORT=0.0.0.0:4317 \
  -e COLLECTOR_OTLP_HTTP_HOST_PORT=0.0.0.0:4318 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 5778:5778 \
  -p 16686:16686 \
  quay.io/jaegertracing/all-in-one:1.63.0
```

## Running PDL with OpenTelemetry

To run PDL with OpenTelemetry, define environment variables before running
your PDL program

```bash
export OTEL_EXPORTER="otlp_http"
export OTEL_ENDPOINT="http://localhost:4318/v1/traces"
export OTEL_SERVICE_NAME=calling_llm
export OTEL_ENVIRONMENT_NAME=dev
pdl ./examples/tutorial/calling_llm.pdl
```

## Viewing trace data

To view trace data, follow the instructions from your OpenTelemetry user interface provider.  For example, if you are using the Jaeger all-in-one, browse to [http://localhost:16686/](http://localhost:16686/).

- In Jaeger, the _Service_ drop-down should include the `$OTEL_SERVICE_NAME`
you specified.  (Click **Reload** of it doesn't.)  Click **Find Traces** to see details of recent traces.  Click on an individual trace to see trace details.

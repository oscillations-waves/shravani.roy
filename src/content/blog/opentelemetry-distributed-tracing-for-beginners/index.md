---
title: "A Beginner's Guide to OpenTelemetry and Distributed Tracing"
summary: "Learn why distributed tracing matters, how OpenTelemetry models a request with traces and spans, and how context propagation keeps the whole story connected."
date: "September 15 2026"
draft: false
tags:
- observability
- opentelemetry
- distributed-tracing
- platform-engineering
- beginners
---

When an application lives in one process, debugging is often straightforward: read the logs, inspect the error, and follow the code path. The picture changes when one user action travels through an API gateway, several services, a queue, and a database.

The question is no longer only *“Did this service fail?”* It becomes:

> Which part of the request was slow, what did it call next, and where did the error begin?

That is the problem **distributed tracing** is built to solve. [OpenTelemetry](https://opentelemetry.io/docs/concepts/) is an open standard and collection of tools for producing, collecting, and exporting observability data such as traces, metrics, and logs.

## Why do we need distributed tracing?

Imagine a customer presses **Place order** in an online shop.

```text
Browser → API gateway → Order service → Payment service
                                └────→ Inventory service
```

The page takes five seconds to respond. A dashboard may tell us that the order service is slow, but that does not explain whether the delay came from payment, inventory, the database, or a retry hidden inside one of those services.

Logs alone make this difficult. Every service creates its own logs, usually on a different machine or in a different container. Without a shared identifier, finding all the lines for one request becomes a search exercise.

Distributed tracing connects the work performed by each service into one request story. It helps teams:

- Find the slowest step in a request path
- See which downstream dependency caused an error
- Understand retries, timeouts, and fan-out calls
- Correlate an alert with the exact request that triggered it
- Debug a system without manually stitching together logs from many services

Tracing does not replace logs or metrics. Metrics show that a problem is happening and how broadly it affects the system. Logs provide detailed events. A trace shows the path a specific request took. Together, they are much more useful than any one signal alone.

## The three words to know: trace, span, and context

### A trace is the full journey

A **trace** represents the end-to-end path of a single request. The checkout action above might result in one trace that starts at the gateway and ends when the response reaches the browser.

Every trace has a trace ID. Think of it as the case number for one request.

### A span is one unit of work

A **span** is one operation within that trace: handling an HTTP request, calling another service, querying a database, or publishing a queue message. Spans have a name, start and end times, a status, attributes, and usually a parent span.

```text
Trace: 7f2a...
└── POST /checkout                  5.0s
    ├── validate cart                80ms
    ├── POST payment service        3.7s
    │   └── charge card              3.5s
    └── GET inventory service       220ms
```

This hierarchy makes the bottleneck visible immediately: the payment call dominates the checkout time. The [OpenTelemetry tracing concepts](https://opentelemetry.io/docs/concepts/signals/traces/) describe spans as the building blocks of a trace.

### Context keeps the story connected

The magic that turns separate service operations into one trace is **context propagation**.

When Service A calls Service B, Service A puts the current trace information into the outgoing request. Service B reads that information, creates a child span, and continues the same trace.

```text
Service A                           Service B
---------                           ---------
create client span                  extract context
      │                                     │
      └── traceparent header ──────────────► create child server span
                                            same trace ID, new span ID
```

For HTTP, OpenTelemetry commonly uses the W3C Trace Context `traceparent` header. Its values include a trace ID and a parent span ID, which lets the receiving service attach its work to the correct trace. [Context propagation](https://opentelemetry.io/docs/concepts/context-propagation/) can also correlate logs and metrics with that same request flow.

## What actually happens during propagation?

There are two operations:

1. **Inject:** before an outbound request or message is sent, the client writes the current trace context into its carrier — for example, HTTP headers or message metadata.
2. **Extract:** when the next service receives that request or message, it reads the context from the carrier and creates a span with the upstream span as its parent.

Most of the time, framework and client instrumentation does this automatically. For example, instrumentation for a web framework can create a server span for incoming HTTP requests, while HTTP-client instrumentation can create client spans and inject the required headers. Manual propagation is mainly needed for custom transports, background jobs, or code that creates its own threads and async boundaries.

## OpenTelemetry’s role

OpenTelemetry is not a tracing backend. It provides a vendor-neutral way to instrument applications and export telemetry. A typical setup looks like this:

```text
Application
  │  creates spans, metrics, and logs
  ▼
OpenTelemetry SDK / auto-instrumentation
  ▼
OpenTelemetry Collector (optional, but common)
  ▼
Observability backend
```

The backend might be Jaeger, Grafana Tempo, Zipkin, a cloud provider, or another compatible product. The OpenTelemetry Collector is often useful as a central place to receive, process, sample, and route telemetry without making every application know the details of the destination.

## A small example

Suppose a Node.js API calls a catalog service. With automatic instrumentation, most of the span creation and HTTP header handling can be done for you. When adding custom work, the application can create a span around the meaningful operation:

```ts
const span = tracer.startSpan("load-featured-products")

try {
  const products = await catalogClient.getFeatured()
  span.setAttribute("product.count", products.length)
  return products
} catch (error) {
  span.recordException(error as Error)
  throw error
} finally {
  span.end()
}
```

The exact setup differs by language, but the idea remains the same: create useful spans around important work, allow the active context to flow to nested operations, and export the data for inspection.

## Tracing asynchronous work

HTTP is the easy case because headers are already designed to carry metadata. Asynchronous systems need the same idea, but the carrier is usually a message.

```text
Order service → queue message → fulfillment worker
```

The producer injects trace context into message metadata. The consumer extracts it when processing the message. The resulting relationship may be a parent-child relationship or a **span link**, depending on the messaging pattern and whether one worker processes one or many messages.

This matters because a job can run minutes after the HTTP request that created it. Without propagation, the trace stops at the queue; with it, teams can still see the causal chain.

## Useful attributes, careful data

Attributes make a trace searchable and understandable. Good attributes are stable, bounded, and useful for debugging:

- `service.name`
- `http.request.method`
- `http.route`
- `db.system`
- `messaging.system`
- A non-sensitive order type or tenant tier

Avoid putting passwords, access tokens, raw personal information, or unbounded values such as full request bodies into spans. Be especially careful with **baggage** — arbitrary key-value data that can be propagated to downstream services. It is convenient, but it can also be logged or sent beyond a trusted boundary. OpenTelemetry’s [context-propagation security guidance](https://opentelemetry.io/docs/concepts/context-propagation/#security-best-practices) recommends treating incoming trace headers from untrusted sources cautiously as well.

## A sensible way to start

You do not need to instrument every function on day one.

1. Pick one request path that crosses at least two services.
2. Add OpenTelemetry SDK setup and resource attributes, especially a clear `service.name`.
3. Enable auto-instrumentation for your HTTP framework, HTTP client, and database library where supported.
4. Export traces to a development backend and make one request end to end.
5. Add a few custom spans only where the business operation is otherwise invisible.
6. Confirm that errors and logs can be found using the trace ID.
7. Decide on sampling and data-retention policies before rolling out broadly.

The first win is simple: go from “the checkout is slow” to “the payment call took 3.5 seconds for this request.” Once that path is visible, distributed systems become much easier to reason about.

## The takeaway

OpenTelemetry gives applications a common language for telemetry. Distributed traces reveal the path of a request, spans describe the work along that path, and context propagation makes sure every service contributes to the same story.

For teams operating distributed systems, that shared story is often the fastest route from a vague symptom to a precise fix.

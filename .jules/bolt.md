## 2024-04-18 - [Backend Data Service] Concurrent Pipeline Stalls
**Learning:** Sequential chunking using `Promise.all(chunk)` for bounded concurrency creates artificial pipeline stalls because the entire batch waits for the slowest task to finish before starting the next batch.
**Action:** Implemented a sliding-window promise pool using `Promise.race` and an execution array to keep exactly `CONCURRENCY_LIMIT` tasks in flight at all times. Also, always attach empty `.catch()` handlers to promises immediately upon creation in manual promise pools to prevent `UnhandledPromiseRejection` crashes from background failures before `Promise.all` can observe them.

## 2024-04-19 - Caching parsed values in DataServices loop
**Learning:** In backend data loops fetching entities where we perform orchestrator checks, `JSON.parse` can become an O(n) overhead if called on every row using a shared entity config object.
**Action:** Use a `WeakMap` mapped to the `config` reference to cache parsed items without mutating the `config` object which is dangerous and can lead to bugs down the line or leak memory.

## 2024-04-25 - [Backend] Skip orchestrator network call when no auth services exist
**Learning:** Checking authorization using an orchestrator creates an O(n) network bottleneck when validating lists of rows. If an entity configures no authorization services for an action, it defaults to allowed, but previously we still made the HTTP request just for the orchestrator to resolve to `{allowed: true}`.
**Action:** Implemented early return `if (services.length === 0)` directly in the backend `OrchestratorService` client to bypass the network entirely for unprotected endpoints/actions.
## 2024-04-27 - [Backend Data Service JSON.parse Cache]
**Learning:** In scenarios where shared configuration objects are read frequently (e.g., config endpointsQueries in the `DataService`), repeating synchronous `JSON.parse` operations causes significant overhead.
**Action:** Use a `WeakMap` keyed by the shared configuration object reference to cache the parsed output. This changes the complexity from O(n) parsing overhead to O(1) retrieval per configuration instance, avoiding repeated parsing while naturally preventing memory leaks when objects are garbage collected.

## 2024-04-28 - [Backend Schema Service JSON.parse Cache]
**Learning:** Parsing JSON from environment variables (like SCHEMA_API_HEADERS and ENUM_API_HEADERS) synchronously on every request to `SchemaService` methods (`getSchemas`, `getSchema`, `getEnum`, `getAllEnums`) causes significant O(n) CPU parsing overhead, which is unnecessary since environment variables do not change frequently during runtime.
**Action:** Implemented caching for parsed environment variable headers using static properties on `SchemaService`. This converts repeated O(n) parsing operations into a single O(1) lookup after the first call.

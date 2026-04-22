## 2024-04-18 - [Backend Data Service] Concurrent Pipeline Stalls
**Learning:** Sequential chunking using `Promise.all(chunk)` for bounded concurrency creates artificial pipeline stalls because the entire batch waits for the slowest task to finish before starting the next batch.
**Action:** Implemented a sliding-window promise pool using `Promise.race` and an execution array to keep exactly `CONCURRENCY_LIMIT` tasks in flight at all times. Also, always attach empty `.catch()` handlers to promises immediately upon creation in manual promise pools to prevent `UnhandledPromiseRejection` crashes from background failures before `Promise.all` can observe them.

## 2024-05-18 - [Backend Auth] Repeated Synchronous JSON Parsing Bottleneck
**Learning:** Because `EntityConfig.auth` is stored as a stringified JSON column, calling `JSON.parse(config.auth)` synchronously inside loops (like `checkAuth` during list data fetches) causes O(n) blocking parsing overhead, stalling the Node.js event loop.
**Action:** Implemented a `WeakMap` keyed by the `config` object reference in `OrchestratorService` to cache the parsed output. This allows O(1) retrieval for repeated operations without memory leaks.

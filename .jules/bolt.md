## 2024-04-18 - [Backend Data Service] Concurrent Pipeline Stalls
**Learning:** Sequential chunking using `Promise.all(chunk)` for bounded concurrency creates artificial pipeline stalls because the entire batch waits for the slowest task to finish before starting the next batch.
**Action:** Implemented a sliding-window promise pool using `Promise.race` and an execution array to keep exactly `CONCURRENCY_LIMIT` tasks in flight at all times. Also, always attach empty `.catch()` handlers to promises immediately upon creation in manual promise pools to prevent `UnhandledPromiseRejection` crashes from background failures before `Promise.all` can observe them.
## 2024-04-20 - [Backend Orchestrator Service] JSON.parse in Loops
**Learning:** Repeatedly calling `JSON.parse` on shared configuration objects inside a loop (like iterating through items to check authorization) creates unnecessary O(n) parsing overhead.
**Action:** Implemented a `WeakMap` cache keyed by the shared configuration object reference. This provides O(1) retrieval of the parsed object and avoids memory leaks without in-place mutations.

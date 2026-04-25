## 2024-04-18 - [Backend Data Service] Concurrent Pipeline Stalls
**Learning:** Sequential chunking using `Promise.all(chunk)` for bounded concurrency creates artificial pipeline stalls because the entire batch waits for the slowest task to finish before starting the next batch.
**Action:** Implemented a sliding-window promise pool using `Promise.race` and an execution array to keep exactly `CONCURRENCY_LIMIT` tasks in flight at all times. Also, always attach empty `.catch()` handlers to promises immediately upon creation in manual promise pools to prevent `UnhandledPromiseRejection` crashes from background failures before `Promise.all` can observe them.

## 2024-04-19 - Caching parsed values in DataServices loop
**Learning:** In backend data loops fetching entities where we perform orchestrator checks, `JSON.parse` can become an O(n) overhead if called on every row using a shared entity config object.
**Action:** Use a `WeakMap` mapped to the `config` reference to cache parsed items without mutating the `config` object which is dangerous and can lead to bugs down the line or leak memory.
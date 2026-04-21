## 2024-04-18 - [Backend Data Service] Concurrent Pipeline Stalls
**Learning:** Sequential chunking using `Promise.all(chunk)` for bounded concurrency creates artificial pipeline stalls because the entire batch waits for the slowest task to finish before starting the next batch.
**Action:** Implemented a sliding-window promise pool using `Promise.race` and an execution array to keep exactly `CONCURRENCY_LIMIT` tasks in flight at all times. Also, always attach empty `.catch()` handlers to promises immediately upon creation in manual promise pools to prevent `UnhandledPromiseRejection` crashes from background failures before `Promise.all` can observe them.

## 2024-11-20 - [Backend Orchestrator Service] Redundant JSON Parsing
**Learning:** Parsing the same JSON string (e.g., config.auth) inside loops (such as checkAuth calls for every item in a list) introduces O(n) parsing overhead that can degrade performance, especially with large datasets.
**Action:** Implemented caching for the parsed JSON configuration using a `WeakMap` keyed by the config object. This eliminates redundant parsing without mutating the original object and prevents memory leaks by allowing the cache to be garbage-collected along with the config object.

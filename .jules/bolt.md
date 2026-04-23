## 2024-04-18 - [Backend Data Service] Concurrent Pipeline Stalls
**Learning:** Sequential chunking using `Promise.all(chunk)` for bounded concurrency creates artificial pipeline stalls because the entire batch waits for the slowest task to finish before starting the next batch.
**Action:** Implemented a sliding-window promise pool using `Promise.race` and an execution array to keep exactly `CONCURRENCY_LIMIT` tasks in flight at all times. Also, always attach empty `.catch()` handlers to promises immediately upon creation in manual promise pools to prevent `UnhandledPromiseRejection` crashes from background failures before `Promise.all` can observe them.
## 2024-04-23 - [Backend Orchestrator Service] JSON.parse in Loops
**Learning:** Parsing shared JSON configurations (like `config.auth`) sequentially inside loops (e.g., when verifying access for multiple entities or dataset rows) incurs massive O(n) overhead, especially noticeable with large datasets.
**Action:** Utilize a `WeakMap` keyed by the shared configuration object reference (`config`) to cache and retrieve the parsed output. This changes the parsing penalty from O(n) to O(1) across the loop without risking memory leaks.

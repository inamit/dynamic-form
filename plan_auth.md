To optimize the backend authorization checks in `DataService.getData`, I'll replace the sequential chunking approach with a true connection pool.

Currently, if `CONCURRENCY_LIMIT` is 5, it waits for all 5 promises in a chunk to complete before starting the next 5. If one of those checks takes 1 second and the rest take 10ms, the pipeline stalls for nearly a full second.
By implementing a sliding window or a `Promise.race` loop for managing executing promises, we can keep exactly `CONCURRENCY_LIMIT` promises running at all times until the queue is drained, maximizing throughput and reducing overall latency for large datasets.

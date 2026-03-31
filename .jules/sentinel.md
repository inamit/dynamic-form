## 2026-03-26 - [Path Traversal in Dynamic Proxy]
**Vulnerability:** The backend dynamically proxies requests to external endpoints via `/api/data/:entity/:id` and `/api/enums/:enumName` by simply appending user input to a configured URL base.
**Learning:** These endpoints were vulnerable to path traversal because `id` and `enumName` inputs were unchecked and directly included in `axios.get(url + '/' + input)`. An attacker could pass `../` to access other backend proxy targets unintentionally.
**Prevention:** Always validate and sanitize user-provided values used to construct paths or URLs in proxies, explicitly blocking traversal patterns like `/` or `..`.

## 2026-03-31 - [SSRF in Dynamic Proxy Routes]
**Vulnerability:** The backend was vulnerable to Server-Side Request Forgery (SSRF) in the GraphQL introspection endpoint (`/api/introspect`) and in data source URL configurations. The proxy routes passed unfiltered URLs directly into `axios.post()` and `axios.get()`.
**Learning:** Attackers could abuse the dynamic proxy nature of the backend by setting `url` payloads or creating/updating `dataSource` entities with URLs pointing to internal network resources (like `http://localhost:port`, `file://`, or AWS instance metadata `http://169.254.169.254`). Without URL scheme validation, Node's `axios` can access protocols beyond HTTP.
**Prevention:** Always parse untrusted URLs using Node's `new URL(url)` and explicitly validate that `parsedUrl.protocol` strictly equals `http:` or `https:`. This prevents fetching from restricted schemas (`file:`, `ftp:`, etc).

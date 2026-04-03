## 2026-03-26 - [Path Traversal in Dynamic Proxy]
**Vulnerability:** The backend dynamically proxies requests to external endpoints via `/api/data/:entity/:id` and `/api/enums/:enumName` by simply appending user input to a configured URL base.
**Learning:** These endpoints were vulnerable to path traversal because `id` and `enumName` inputs were unchecked and directly included in `axios.get(url + '/' + input)`. An attacker could pass `../` to access other backend proxy targets unintentionally.
**Prevention:** Always validate and sanitize user-provided values used to construct paths or URLs in proxies, explicitly blocking traversal patterns like `/` or `..`.

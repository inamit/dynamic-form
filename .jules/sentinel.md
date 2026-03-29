## 2026-03-26 - [Path Traversal in Dynamic Proxy]
**Vulnerability:** The backend dynamically proxies requests to external endpoints via `/api/data/:entity/:id` and `/api/enums/:enumName` by simply appending user input to a configured URL base.
**Learning:** These endpoints were vulnerable to path traversal because `id` and `enumName` inputs were unchecked and directly included in `axios.get(url + '/' + input)`. An attacker could pass `../` to access other backend proxy targets unintentionally.
**Prevention:** Always validate and sanitize user-provided values used to construct paths or URLs in proxies, explicitly blocking traversal patterns like `/` or `..`.

## 2026-03-27 - [SSRF via URL Input in Management Endpoints]
**Vulnerability:** The `/api/introspect` and `/api/data-sources` endpoints accepted raw URLs (`url` and `apiUrl`) from user input and made backend requests (via axios or proxying logic) without validating the URL protocol.
**Learning:** This allowed an attacker to supply URLs with malicious protocols like `file:` or `ftp:`, leading to Server-Side Request Forgery (SSRF) vulnerabilities where the backend accesses unintended internal resources or local files. Note that restricting protocols does not fully mitigate SSRF against internal network IP addresses (which requires DNS resolution checks).
**Prevention:** Always validate user-provided URLs using Node's native `URL` class (`new URL(string)`) and strictly enforce an allowlist for protocols (e.g., `http:` and `https:`) before making any outgoing requests or storing URLs for proxying.

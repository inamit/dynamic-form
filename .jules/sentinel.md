## 2024-04-02 - [Server-Side Request Forgery (SSRF) in Proxy Routes]
**Vulnerability:** The backend dynamically proxies requests to external endpoints (e.g., `/api/data-sources`, `/api/introspect`) without strict URL protocol validation.
**Learning:** This could allow an attacker to make requests to internal files using protocols like `file://` or to internal services, bypassing network controls.
**Prevention:** Enforce `http:` and `https:` URL protocols using Node's `URL` class before making external requests in proxy endpoints.

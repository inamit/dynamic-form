## 2024-04-01 - [SSRF in Proxy Endpoints]
**Vulnerability:** The backend application blindly proxies HTTP requests to external URLs (e.g., `/api/introspect`, `/api/data/:entity`) provided by user input or database configurations without validating the protocol.
**Learning:** In dynamically configured API gateways or proxies, trusting the destination URL completely allows Server-Side Request Forgery (SSRF), enabling attackers to reach internal services (e.g., `file://`, `http://localhost`).
**Prevention:** Always parse untrusted URLs using the `URL` class and explicitly allowlist only safe protocols (e.g., `http:` and `https:`).

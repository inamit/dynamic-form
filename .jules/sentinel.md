## 2024-03-28 - SSRF in Data Source Configurations and Proxies
**Vulnerability:** Server-Side Request Forgery (SSRF) exists in `/api/data-sources` (POST/PUT) and `/api/introspect` (POST) because user-provided URLs (`apiUrl` and `url`) are not validated before being saved to the database or used in backend HTTP requests via `axios`. This allows users to set arbitrary URLs (e.g., `file://`, `ftp://`, internal network IPs) that the backend will try to access, potentially exposing internal services or local files.
**Learning:** The application acts as a proxy/gateway to external APIs based on user configuration, making it a high-risk vector for SSRF. The root cause is a lack of strict protocol and hostname validation on user-submitted URLs.
**Prevention:** Implement strict URL validation for all user-provided endpoints. Ensure only `http:` and `https:` protocols are permitted before saving configurations or initiating outgoing backend requests.

## 2024-04-03 - Protocol Smuggling SSRF bypass via URL Constructor
**Vulnerability:** An existing fix used `new URL(path, base)` to validate outgoing proxies dynamically. However, since user-supplied parameters (like entity IDs and names) were used as the `path`, providing an absolute URL (like `http://attacker.com`) as the `path` overrides the `base` URL, bypassing intended protections and allowing requests to arbitrary hostnames.
**Learning:** When using Node.js URL API for SSRF prevention, dynamic user input supplied as the `path` parameter inside the constructor can override the intended base URL entirely.
**Prevention:** Construct URLs using string concatenation before parsing, strictly validate protocols, and independently assert that the resulting URL origin strictly matches the expected base URL origin.

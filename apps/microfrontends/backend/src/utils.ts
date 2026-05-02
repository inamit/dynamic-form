export function validateUrl(urlString: string): string {
    const url = new URL(urlString);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid URL protocol. Only HTTP and HTTPS are allowed.');
    }
    return url.href;
}

export function isValidParam(param: string): boolean {
    return /^[a-zA-Z0-9_\-\u0590-\u05FF]+$/.test(param);
}

// ⚡ Bolt Optimization: Cache parsed string values to avoid repeated JSON.parse overhead
const jsonParseCache = new Map<string, any>();

export function cachedJsonParse(str: string): any {
    if (!str) return undefined;
    if (jsonParseCache.has(str)) {
        const cached = jsonParseCache.get(str);
        // Return a cloned object to prevent callers from unintentionally mutating the shared cache reference,
        // which could lead to cross-request data leaks.
        // For simple nested objects, a deep clone ensures complete safety while still being faster than parsing the raw string.
        return typeof cached === 'object' && cached !== null ? JSON.parse(JSON.stringify(cached)) : cached;
    }
    const parsed = JSON.parse(str);

    // Cap cache size to avoid memory leaks
    if (jsonParseCache.size > 1000) {
        const firstKey = jsonParseCache.keys().next().value;
        if (firstKey !== undefined) {
            jsonParseCache.delete(firstKey);
        }
    }

    jsonParseCache.set(str, parsed);
    return parsed;
}

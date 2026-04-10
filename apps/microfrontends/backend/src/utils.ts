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

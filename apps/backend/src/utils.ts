export function validateUrl(urlString: string): string {
    const url = new URL(urlString);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid URL protocol. Only HTTP and HTTPS are allowed.');
    }
    return url.href;
}

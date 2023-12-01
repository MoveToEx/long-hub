

export function createQueryString(url: string, params: Record<string, any>) {
    const qs = new URLSearchParams();
    for (const key in params) {
        qs.set(key, params[key]);
    }
    return url + '?' + qs.toString();
}
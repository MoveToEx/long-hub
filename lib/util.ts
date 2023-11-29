

export function createQueryString(params: Record<string, any>) {
    const qs = new URLSearchParams();
    for (const key in params) {
        qs.set(key, params[key]);
    }
    return qs.toString();
}
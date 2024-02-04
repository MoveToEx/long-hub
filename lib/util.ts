
import { NextRequest, NextResponse } from "next/server";
import { EnqueueSnackbar } from "notistack";

export function createQueryString(url: string, params: Record<string, any>) {
    const qs = new URLSearchParams();
    for (const key in params) {
        qs.set(key, params[key]);
    }
    return url + '?' + qs.toString();
}

export function writeClipboard(items: Record<string, any>, notify?: EnqueueSnackbar | undefined) {
    const item = new ClipboardItem(items);
    navigator.clipboard.write([item])
        .then(() => notify && notify('Copied to clipboard', { variant: 'success' }))
        .catch((e) => notify && notify('Failed when copying: ' + e, { variant: 'error' }));
}


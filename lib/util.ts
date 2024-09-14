
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

export async function copyImage(
    src: string,
    onProgress: (percentage: number) => void
) {
    const chunks = [];
    const response = await fetch(src);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    if (response.body === null) {
        throw new Error('Unexpected null body');
    }

    const reader = response.body.getReader();
    const contentLength = Number(response.headers.get('Content-Length') ?? '0');

    if (contentLength == 0) {
        throw new Error('Unexpected zero-length response');
    }

    let received = 0;

    while (1) {
        const { done, value } = await reader.read();

        if (done) {
            break;
        }
        
        chunks.push(value);
        received += value.length;
        onProgress(received / contentLength * 100);

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const blob = new Blob(chunks);

    if (blob.type === 'image/png') {
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);
        return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context === null) {
        throw new Error('Unable to get canvas context');
    }

    const image: HTMLImageElement = await new Promise((resolve, reject) => {
        const element = document.createElement('img');

        element.onload = () => resolve(element);
        element.onerror = reject;
        element.src = URL.createObjectURL(blob);
    });

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const pngBlob: Blob | null = await new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (blob === null) {
                reject('Cannot convert canvas to blob');
            }
            else {
                resolve(blob);
            }
        }, 'image/png');
    });

    if (pngBlob === null) {
        throw new Error('Failed fetching image');
    }

    await navigator.clipboard.write([
        new ClipboardItem({
            [pngBlob.type]: pngBlob
        })
    ]);
}
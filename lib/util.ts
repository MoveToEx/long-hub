
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

export async function copyImage(element: HTMLImageElement, onInfo?: (info: string) => void) {
    const src = element.src;

    if (src.endsWith('gif') && onInfo) onInfo('Only the first frame will be copied');

    const blob = await fetch(src).then(x => x.blob());

    const items = [];

    if (blob.type === 'image/png') {
        items.push(new ClipboardItem({
            [blob.type]: blob
        }));
        await navigator.clipboard.write(items);
        return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context === null) {
        throw new Error('unable to get canvas context');
        return;
    }

    await new Promise((resolve, reject) => {
        const image = document.createElement('img');

        image.onload = async (e) => {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.drawImage(image, 0, 0);

            const blob: Blob = await new Promise((resolve, reject) => {
                canvas.toBlob(blob => {
                    if (blob === null) {
                        reject('Cannot convert canvas to blob');
                    }
                    else {
                        resolve(blob);
                    }
                }, 'image/png');
            });

            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);
        }

        image.src = URL.createObjectURL(blob);

        resolve(null);
    });
}
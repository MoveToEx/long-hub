'use client';

import Image from 'next/image';
import _ from 'lodash';
import { useSnackbar, EnqueueSnackbar } from 'notistack';
import { useRef } from 'react';

async function CopyImage(img: HTMLImageElement | null, enqueueSnackbar: EnqueueSnackbar) {
    if (!img) {
        enqueueSnackbar('Uncompressed image is still loading', { variant: 'info' });
        return;
    }
    const write = (blobs: Record<string, Blob>) => {
        const item = new ClipboardItem(blobs);
        navigator.clipboard.write([item])
            .then(() => enqueueSnackbar('Copied to clipboard', { variant: 'success' }))
            .catch((e) => enqueueSnackbar('Failed when copying: ' + e, { variant: 'error' }));
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context === null) throw new Error('unable to get canvas context');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(img, 0, 0);

    canvas.toBlob(blob => {
        if (blob === null) throw new Error('unable to convert to png blob');

        write({
            [blob.type]: blob
        });

    }, "image/png");
}


export default function CopiableImage({
    src,
    alt,
}: {
    src: string,
    alt: string,
}) {
    const image = useRef<HTMLImageElement>(null);
    const { enqueueSnackbar } = useSnackbar();
    return (
        <Image
            ref={image}
            unoptimized
            crossOrigin="anonymous"
            src={src}
            width={300}
            height={500}
            alt={alt}
            style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain'
            }}
            onClick={() => {
                if (image.current === null) return;

                const write = (blobs: Record<string, Blob>) => {
                    const item = new ClipboardItem(blobs);
                    navigator.clipboard.write([item])
                        .then(() => enqueueSnackbar('Copied to clipboard', { variant: 'success' }))
                        .catch((e) => enqueueSnackbar('Failed when copying: ' + e, { variant: 'error' }));
                }

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (context === null) throw new Error('unable to get canvas context');

                canvas.width = image.current.naturalWidth;
                canvas.height = image.current.naturalHeight;
                context.fillStyle = 'white';
                context.fillRect(0, 0, canvas.width, canvas.height);

                context.drawImage(image.current, 0, 0);

                canvas.toBlob(blob => {
                    if (blob === null) throw new Error('unable to convert to png blob');

                    write({
                        [blob.type]: blob
                    });

                }, "image/png");
            }}
        />
    );
}
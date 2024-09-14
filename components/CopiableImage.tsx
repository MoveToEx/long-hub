'use client';

import Image from 'next/image';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { copyImage } from '@/lib/util';
import styles from './components.module.css';

export default function CopiableImage({
    src,
    alt,
}: {
    src: string,
    alt: string,
}) {
    const { enqueueSnackbar } = useSnackbar();
    return (
        <Image
            unoptimized
            crossOrigin="anonymous"
            src={src}
            width={300}
            height={300}
            alt={alt}
            style={{
                width: '100%',
                height: 'auto',
                maxHeight: '300px',
                objectFit: 'contain'
            }}
            onClick={async (e) => {
                if (!navigator.clipboard) {
                    enqueueSnackbar('navigator.clipboard is undefined', { variant: 'error' });
                    return;
                }

                if (src.endsWith('gif')) enqueueSnackbar('Only the first frame will be copied', { variant: 'info' });
                const img = e.currentTarget;
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (context === null) {
                    enqueueSnackbar('Unable to get canvas context', { variant: 'error'} );
                    return;
                }
                
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                context.fillStyle = 'white';
                context.fillRect(0, 0, canvas.width, canvas.height);
                
                context.drawImage(img, 0, 0);

                const blob: Blob | null = await new Promise((resolve, reject) => {
                    canvas.toBlob(res => {
                        if (res === null) reject('Failed when converting to blob');

                        resolve(res);
                    }, 'image/png');
                });

                if (!blob) {
                    enqueueSnackbar('Cannot convert image to blob', { variant: 'error' });
                    return;
                }

                const item = new ClipboardItem({
                    [blob.type]: blob
                });

                await navigator.clipboard.write([item]);

                enqueueSnackbar('Copied to clipboard', { variant: 'success' });
            }}
        />
        );
}
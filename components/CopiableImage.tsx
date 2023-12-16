'use client';

import Image from 'next/image';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { writeClipboard } from '@/lib/util';
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
            height={500}
            alt={alt}
            style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain'
            }}
            onClick={(e) => {
                if (src.endsWith('gif')) enqueueSnackbar('Only the first frame will be copied', { variant: 'info' });
                const img = e.currentTarget;
                
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

                    writeClipboard({
                        [blob.type]: blob
                    }, enqueueSnackbar);

                }, "image/png");
            }}
        />
        );
}
'use client';

import Image from 'next/image';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { copyImage, copyImageElement } from '@/lib/util';
import styles from './components.module.css';
import { ImageProps } from 'next/image';
import { useRef } from 'react';

export default function CopiableImage({
    src,
    alt,
    ImageProps = undefined
}: {
    src: string,
    alt: string,
    ImageProps?: Omit<ImageProps, 'src' | 'alt'> & Partial<Omit<ImageProps, 'height' | 'width'>>
}) {
    const { enqueueSnackbar } = useSnackbar();
    const image = useRef<HTMLImageElement>(null);
    return (
        <Image
            {...ImageProps}
            ref={image}
            className="w-full h-auto max-h-80 object-contain"
            unoptimized
            crossOrigin="anonymous"
            src={src}
            width={320}
            height={320}
            alt={alt}
            onClick={async (e) => {
                if (image.current === null) return;

                if (!navigator.clipboard) {
                    enqueueSnackbar('navigator.clipboard is undefined', { variant: 'error' });
                    return;
                }

                if (src.endsWith('gif')) enqueueSnackbar('Only the first frame will be copied', { variant: 'info' });
                
                try {
                    await copyImageElement(image.current);
                    enqueueSnackbar('Copied to clipboard', { variant: 'success' });
                }
                catch (e) {
                    enqueueSnackbar('Failed: ' + e, { variant: 'error' });
                }
            }}
        />
    );
}
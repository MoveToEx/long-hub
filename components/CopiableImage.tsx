'use client';

import Image from 'next/image';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { copyImageElement } from '@/lib/util';
import { ImageProps } from 'next/image';
import { useRef } from 'react';

export default function CopiableImage({ src, alt, ...props }: ImageProps) {
    const { enqueueSnackbar } = useSnackbar();
    const image = useRef<HTMLImageElement>(null);
    return (
        <Image
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

                if (src instanceof String && src.endsWith('gif')) {
                    enqueueSnackbar('Only the first frame will be copied', { variant: 'info' });
                }

                try {
                    await copyImageElement(image.current);
                    enqueueSnackbar('Copied to clipboard', { variant: 'success' });
                }
                catch (e) {
                    enqueueSnackbar('Failed: ' + e, { variant: 'error' });
                }
            }}
            {...props}
        />
    );
}
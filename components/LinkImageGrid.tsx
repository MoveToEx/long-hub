'use client';

import Image from 'next/image';
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'next/link';
import _ from 'lodash';
import { useSnackbar } from 'notistack';

interface LinkImage {
    href: string;
    src: string;
}

export default function LinkImageGrid({
    src,
    gridProps,
    gridContainerProps,
    linkProps
}: {
    src: LinkImage[],
    gridProps?: any,
    gridContainerProps?: any,
    linkProps?: any
}) {
    const { enqueueSnackbar } = useSnackbar();
    var elem = src.map((e, i) => (
        <Grid {...gridProps} key={i}>
            <Link {...linkProps} href={e.href} key={e.href}>
                <Image
                    src={e.src}
                    alt={e.src}
                    height={300}
                    width={300}
                    style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain'
                    }}
                    onClick={(event) => {
                        if (!event.ctrlKey) {
                            return;
                        }

                        event.preventDefault();
                        event.stopPropagation();

                        const src = e.src;

                        const write = (blobs: Record<string, Blob>) => {
                            const item = new ClipboardItem(blobs);
                            navigator.clipboard.write([item])
                                .then(() => enqueueSnackbar('Copied to clipboard', { variant: 'success' }))
                                .catch((e) => enqueueSnackbar('Failed when copying: ' + e, { variant: 'error' }));
                        }

                        fetch(src).then(x => x.blob()).then(blob => {
                            if (blob.type === 'image/png') {
                                write({
                                    [blob.type]: blob
                                });
                                return;
                            }
                            const canvas = document.createElement('canvas');
                            const context = canvas.getContext('2d');
                            const image = document.createElement('img');
                            if (context === null) throw new Error('unable to get canvas context');
                            
                            image.onload = (e) => {
                                canvas.width = image.naturalWidth;
                                canvas.height = image.naturalHeight;
                                context.fillStyle = 'white';
                                context.fillRect(0, 0, canvas.width, canvas.height);

                                context.drawImage(image, 0, 0);

                                canvas.toBlob(blob => {
                                    if (blob === null) throw new Error('unable to convert to png blob');

                                    write({
                                        [blob.type]: blob
                                    });

                                }, "image/png");
                            }

                            image.src = URL.createObjectURL(blob);
                        });
                    }}
                />
            </Link>
        </Grid>
    ));

    return (
        <Grid {...gridContainerProps} container>
            {elem}
        </Grid>
    );
}

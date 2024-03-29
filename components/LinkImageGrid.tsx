'use client';

import Image from 'next/image';
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'next/link';
import Skeleton from '@mui/material/Skeleton';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { writeClipboard } from '@/lib/util';
import styles from './components.module.css';

interface LinkImage {
    href: string;
    src: string;
}

export function SkeletonGrid({ count }: { count: number }) {

}

export default function LinkImageGrid({
    src,
    gridProps,
    gridContainerProps,
    disabled = false,
    skeleton = 0,
    linkProps
}: {
    src: LinkImage[],
    gridProps?: any,
    disabled?: boolean,
    gridContainerProps?: any,
    skeleton?: number,
    linkProps?: any
}) {
    const { enqueueSnackbar } = useSnackbar();
    let elem;

    if (skeleton) {
        elem = _.range(skeleton).map(i => (
            <Grid {...gridProps} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{width: '100%'}} />
            </Grid>
        ));
    }
    else {
        elem = src.map((e, i) => (
            <Grid {...gridProps} key={i}>
                <Link {...linkProps} href={e.href} key={e.href}>
                    <Image
                        src={e.src}
                        alt={e.src}
                        height={300}
                        className={disabled ? styles['grid-image-disabled'] : ''}
                        width={300}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            width: 'auto',
                            minWidth: '100%',
                            minHeight: '100%',
                            objectFit: 'contain',
                        }}
                        onClick={disabled ? () => { } : (event) => {
                            if (!event.ctrlKey) {
                                return;
                            }
                            event.preventDefault();
                            event.stopPropagation();

                            const src = e.src;
                            const element = event.currentTarget;
                            element.classList.add(styles['grid-image-fetching']);
                            if (src.endsWith('gif')) enqueueSnackbar('Only the first frame will be copied', { variant: 'info' });

                            fetch(src).then(x => x.blob()).then(blob => {
                                if (blob.type === 'image/png') {
                                    writeClipboard({
                                        [blob.type]: blob
                                    }, enqueueSnackbar);
                                    element.classList.remove(styles['grid-image-fetching']);
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
                                        element.classList.remove(styles['grid-image-fetching']);

                                        writeClipboard({
                                            [blob.type]: blob
                                        }, enqueueSnackbar);

                                    }, "image/png");
                                }

                                image.src = URL.createObjectURL(blob);
                            });
                        }}
                    />
                </Link>
            </Grid>
        ));
    }


    return (
        <Grid {...gridContainerProps} container>
            {elem}
        </Grid>
    );
}

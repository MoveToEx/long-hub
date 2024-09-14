import _ from 'lodash';
import Grid from '@mui/material/Grid2';
import CircularProgress from '@mui/material/CircularProgress';
import { useState, ElementType, ComponentProps, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import Image, { ImageProps } from 'next/image';
import { preload } from 'swr';
import { PostFetcher } from '@/app/post/context';
import styles from './components.module.css';
import Fab from '@mui/material/Fab';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Stack from '@mui/material/Stack';
import CopiableText from '@/components/CopiableText';
import TagRow from '@/components/TagRow';

type PostGridProps = {
    value: {
        id: string;
        imageURL: string;
        text?: string;
        tags: { name: string }[];
    },
    ImageProps?: Omit<ImageProps, 'src' | 'alt'>,
    prefetch?: boolean
};

export default function PostGrid({
    value,
    ImageProps,
    prefetch = true
}: PostGridProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [copying, setCopying] = useState(false);
    const [progress, setProgress] = useState(0);

    const copy = useCallback(async () => {
        setCopying(true);

        const src = value.imageURL;

        if (src.endsWith('gif')) {
            enqueueSnackbar('Only the first frame will be copied', { variant: 'info' });
        }

        const chunks = [];
        const response = await fetch(src);

        if (!response.ok) {
            enqueueSnackbar(response.statusText, { variant: 'error' });
            return;
        }

        if (response.body === null) {
            enqueueSnackbar('Unexpected null body', { variant: 'error' });
            return;
        }

        const reader = response.body.getReader();

        const contentLength = Number(response.headers.get('Content-Length') ?? '0');

        if (contentLength == 0) {
            enqueueSnackbar('Unexpected zero-length response', { variant: 'error' });
            return;
        }

        let received = 0;

        while (1) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
            received += value.length;

            setProgress(received / contentLength * 100);
        }

        const blob = new Blob(chunks);

        if (blob.type === 'image/png') {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ]);
            }
            catch (e: any) {
                enqueueSnackbar(e, { variant: 'error' });
                setCopying(false);
            }
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context === null) {
            enqueueSnackbar('Unable to get canvas context', { variant: 'error' });
            setCopying(false);
            return;
        }

        const image: HTMLImageElement = await new Promise((resolve, reject) => {
            const element = document.createElement('img');

            element.onload = async (e) => {
                resolve(element);
            }
            element.onerror = async (e) => {
                reject(e);
            }
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
            enqueueSnackbar('Failed fetching image', { variant: 'error' });
            return;
        }

        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': pngBlob
                })
            ]);
        }
        catch (e: any) {
            enqueueSnackbar(e, { variant: 'error' });
        }

        enqueueSnackbar('Copied to clipboard', { variant: 'success' });
        setCopying(false);
        setProgress(0);
    }, [value, enqueueSnackbar]);

    return (
        <div className={styles['grid-image-container']}>
            <Grid container spacing={1}>
                <Grid size={4}>
                    <Link href={`/post/${value.id}`} style={{ maxWidth: '100%' }}>
                        <Image
                            src={value.imageURL}
                            alt={value.id}
                            height={150}
                            width={150}
                            style={{
                                maxWidth: '100%',
                                minHeight: '150px',
                                objectFit: 'contain',
                            }}
                        />
                    </Link>
                </Grid>
                <Grid size="grow">
                    <Stack spacing={1} justifyItems="center">
                        <CopiableText text={value.id}/>
                        <div>
                            {value.text ?? <i>Notext</i>}
                        </div>
                        <div>
                            <TagRow tags={value.tags.map(e => e.name)} />
                        </div>
                    </Stack>
                </Grid>
            </Grid>
        </div>
    )
}
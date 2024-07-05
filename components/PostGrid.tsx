import _ from 'lodash';
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

type PostGridProps = {
    value: {
        imageURL: string;
        text?: string;
        id: string;
    },
    ImageProps?: Omit<ImageProps, 'src' | 'alt'>,
    newTab?: boolean,
    prefetch?: boolean
};

export default function PostGrid({
    value,
    ImageProps,
    newTab,
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
        const items = [];

        if (blob.type === 'image/png') {
            items.push(new ClipboardItem({
                [blob.type]: blob
            }));
            try {
                await navigator.clipboard.write(items);
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

        await new Promise((resolve, reject) => {
            const image = document.createElement('img');

            image.onload = async (e) => {
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                context.fillStyle = 'white';
                context.fillRect(0, 0, canvas.width, canvas.height);

                context.drawImage(image, 0, 0);

                const blob: Blob | null = await new Promise((_resolve, _reject) => {
                    canvas.toBlob(blob => {
                        if (blob === null) {
                            _reject('Cannot convert canvas to blob');
                        }
                        else {
                            _resolve(blob);
                        }
                    }, 'image/png');
                });

                if (blob === null) {
                    reject('Failed fetching image');
                    return;
                }

                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': blob
                        })
                    ]);
                }
                catch (e: any) {
                    reject(e);
                }
                resolve(null);
            }
            image.src = URL.createObjectURL(blob);
        }).then(() => {
            enqueueSnackbar('Copied to clipboard', { variant: 'success' });
        }).catch(reason => {
            enqueueSnackbar(reason, { variant: 'error' });
        });

        setCopying(false);
        setProgress(0);
    }, [value, enqueueSnackbar]);

    const image = (
        <Image
            src={value.imageURL}
            alt={value.text ?? value.id}
            height={300}
            width={300}
            className={copying ? styles['grid-image-fetching'] : ''}
            style={{
                maxWidth: '100%',
                maxHeight: '300px',
                width: 'auto',
                minWidth: '100%',
                minHeight: '100%',
                objectFit: 'contain',
            }}
            onMouseOver={prefetch ? () => {
                preload(value.id, PostFetcher);
            } : () => { }}
            onClick={async (event) => {
                if (!event.ctrlKey || copying) {
                    return;
                }
                await copy();
            }}
            {...ImageProps}
        />
    );

    let link;

    if (newTab) {
        link = (
            <a
                href={`/post/${value.id}`}
                target="_blank"
                style={{
                    display: 'block',
                    position: 'relative'
                }}>
                {image}
                {copying && <CircularProgress className={styles['progress']} variant="determinate" value={progress} />}
            </a>
        )
    }
    else {
        link = (
            <Link
                href={`/post/${value.id}`}
                prefetch={prefetch}
                style={{
                    display: 'block',
                    position: 'relative'
                }}>
                {image}
                {copying && <CircularProgress className={styles['progress']} variant="determinate" value={progress} />}
            </Link>
        );
    }

    return (
        <div className={styles['grid-image-container']} style={{ position: 'relative' }}>
            <Fab
                sx={{
                    position: 'absolute',
                    left: '10px',
                    top: '10px',
                }}
                onClick={async () => {
                    if (copying) return;

                    await copy();
                }}
                size="medium"
                className={styles['copy-button']}>
                <ContentCopyIcon />
            </Fab>
            {link}
        </div>
    )
}
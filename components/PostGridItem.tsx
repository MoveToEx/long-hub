import _ from 'lodash';
import CircularProgress from '@mui/material/CircularProgress';
import { useState, ElementType, ComponentProps, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import Image, { ImageProps } from 'next/image';
import { preload } from 'swr';
import { PostFetcher } from '@/app/context';
import styles from './components.module.css';
import Fab from '@mui/material/Fab';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { copyImage } from '@/lib/util';

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
        try {
            await copyImage(value.imageURL, (val) => setProgress(val));
            enqueueSnackbar('Copied to clipboard', { variant: 'success' });
        }
        catch (e) {
            enqueueSnackbar('Failed: ' + e, { variant: 'error' });
        }
        setCopying(false);
        setProgress(0);
    }, [enqueueSnackbar, value]);

    const image = (
        <Image
            src={value.imageURL}
            alt={value.text ?? value.id}
            height={300}
            width={300}
            unoptimized
            loading="eager"
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
                preload('/api/post/' + value.id, PostFetcher);
            } : undefined}
            {...ImageProps}
        />
    );

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
            <Link
                href={`/post/${value.id}`}
                prefetch={prefetch}
                target={newTab ? '_blank' : undefined}
                style={{
                    display: 'block',
                    position: 'relative'
                }}>
                {image}
                {copying && <CircularProgress className={styles['progress']} variant="determinate" value={progress} />}
            </Link>
        </div>
    )
}
import _ from 'lodash';
import CircularProgress from '@mui/material/CircularProgress';
import { useState, useCallback } from 'react';
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

    return (
        <div className="group relative">
            <Fab
                sx={theme => ({
                    position: 'absolute',
                    transition: theme.transitions.create('opacity', {
                        duration: theme.transitions.duration.shortest
                    })
                })}
                onClick={async () => {
                    if (copying) return;

                    await copy();
                }}
                size="medium"
                className="left-2 top-2 opacity-0 group-hover:opacity-100">
                <ContentCopyIcon />
            </Fab>
            <Link
                href={`/post/${value.id}`}
                prefetch={prefetch}
                target={newTab ? '_blank' : undefined}
                className="block relative">
                <Image
                    src={value.imageURL}
                    alt={value.text ?? value.id}
                    height={300}
                    width={300}
                    unoptimized
                    crossOrigin="anonymous"
                    loading="eager"
                    className={
                        (copying ? 'opacity-50 cursor-default ' : '') +
                        "object-contain h-[300px] w-full"
                    }
                    onMouseOver={prefetch ? () => {
                        preload('/api/post/' + value.id, PostFetcher);
                    } : undefined}
                    {...ImageProps}
                />
                {copying &&
                    <CircularProgress
                        className={styles['progress']}
                        variant="determinate"
                        value={progress} />
                }
            </Link>
        </div>
    )
}
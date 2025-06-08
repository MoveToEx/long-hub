import _ from 'lodash';
import CircularProgress from '@mui/material/CircularProgress';
import { useState, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import styles from './components.module.css';
import Fab from '@mui/material/Fab';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { copyImage } from '@/lib/util';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import { ReactElement } from 'react';
import Image, { ImageProps } from 'next/image';

import { preload } from 'swr';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link, { LinkProps } from 'next/link';
import TagRow from './TagRow';
import { PostFetcher } from '@/app/context';

function GridSkeleton({
    count
}: {
    count: number
}) {
    return (
        <Box sx={{ m: 1 }}>
            <Grid container spacing={2}>
                {_.range(count).map(i => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i.toString()}>
                        <Skeleton variant="rectangular" height={300} sx={{ width: '100%' }} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

function ListSkeleton({
    count
}: {
    count: number
}) {
    return (
        <Box sx={{ m: 1 }}>
            <Grid container spacing={2}>
                {_.range(count).map(i => (
                    <Grid size={{ xs: 12, md: 8 }} offset={{ md: 2 }} key={i.toString()}>
                        <Skeleton variant="rectangular" height={150} sx={{ width: '100%' }} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}


export function GridPost({
    post,
    ImageProps,
    LinkProps,
    prefetch = true,
    imageWrapper,
}: {
    post: {
        imageURL: string;
        text?: string;
        id: string;
    },
    ImageProps?: Omit<ImageProps, 'src' | 'alt'>,
    LinkProps?: Omit<LinkProps, 'href'>,
    prefetch?: boolean,
    imageWrapper?: (elem: ReactElement) => ReactElement | undefined
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [copying, setCopying] = useState(false);
    const [progress, setProgress] = useState(0);

    const copyUrl = useCallback(async (url: string) => {
        setCopying(true);
        try {
            await copyImage(url, (val) => setProgress(val));
            enqueueSnackbar('Copied to clipboard', { variant: 'success' });
        }
        catch (e) {
            enqueueSnackbar('Failed: ' + e, { variant: 'error' });
        }
        setCopying(false);
        setProgress(0);
    }, [enqueueSnackbar]);

    const imageElement = (
        <Image
            src={post.imageURL}
            alt={post.text ?? post.id}
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
                preload('/api/post/' + post.id, PostFetcher);
            } : undefined}
            {...ImageProps}
        />
    );

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

                    await copyUrl(post.imageURL);
                }}
                size="medium"
                className="left-2 top-2 opacity-0 group-hover:opacity-100">
                <ContentCopyIcon />
            </Fab>
            <Link
                href={`/post/${post.id}`}
                prefetch={prefetch}
                className="block relative"
                {...LinkProps}>
                {imageWrapper?.(imageElement) ?? imageElement}
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

export function ListPost({
    post,
    ImageProps,
    LinkProps,
    prefetch = true
}: {
    post: {
        imageURL: string;
        text?: string;
        tags?: { name: string }[];
        id: string;
    },
    ImageProps?: Omit<ImageProps, 'src' | 'alt'>,
    LinkProps?: Omit<LinkProps, 'href'>,
    prefetch?: boolean
}) {
    return (
        <Grid container spacing={1} onMouseOver={prefetch ? () => {
            preload('/api/post/' + post.id, PostFetcher);
        } : undefined}>
            <Grid size={4}>
                <Link href={`/post/${post.id}`} className="max-w-full" {...LinkProps}>
                    <Image
                        src={post.imageURL}
                        alt={post.id}
                        height={160}
                        width={160}
                        unoptimized
                        crossOrigin="anonymous"
                        loading="eager"
                        className="w-full min-h-40 object-contain"
                        {...ImageProps}
                    />
                </Link>
            </Grid>
            <Grid size="grow">
                <Stack spacing={1} justifyItems="center">
                    <Typography>{post.id}</Typography>
                    <Typography>{post.text ?? <i>No text</i>}</Typography>
                    {post.tags && <TagRow tags={post.tags.map(e => e.name)} />}
                </Stack>
            </Grid>
        </Grid>
    );
}

export default function Posts<E extends {
    id: string,
    text?: string,
    imageURL: string,
    tags?: { name: string }[]
}>({
    prefetch,
    skeleton,
    layout,
    posts,
    ImageProps,
    LinkProps,
    wrapper
}: {
    prefetch?: boolean,
    skeleton?: number,
    layout: 'grid' | 'list',
    posts?: E[] | undefined,
    ImageProps?: Omit<ImageProps, 'src' | 'alt'>,
    LinkProps?: Omit<LinkProps, 'href' | 'prefetch'>,
    wrapper?: (element: ReactElement, post: E) => ReactElement,
}) {
    if (posts === undefined && skeleton) {
        if (layout === 'grid') {
            return <GridSkeleton count={skeleton} />
        } else {
            return <ListSkeleton count={skeleton} />
        }
    }
    if (!posts) return <></>;


    return (
        <Box sx={{ m: 1 }}>
            <Grid container spacing={2}>
                {
                    layout == 'grid' &&
                    posts.map(post => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={post.id}>
                            <GridPost
                                prefetch={prefetch}
                                ImageProps={ImageProps}
                                LinkProps={LinkProps}
                                post={post}
                                imageWrapper={(elem) => wrapper?.(elem, post)}
                            />
                        </Grid>
                    ))
                }
                {
                    layout == 'list' &&
                    posts.map(post => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={post.id}>
                            <ListPost
                                prefetch={prefetch}
                                ImageProps={ImageProps}
                                LinkProps={LinkProps}
                                post={post} />
                        </Grid>
                    ))
                }
            </Grid>
        </Box>
    );
}
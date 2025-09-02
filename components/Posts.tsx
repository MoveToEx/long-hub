import _ from 'lodash';
import CircularProgress from '@mui/material/CircularProgress';
import { useState, useCallback, ReactNode } from 'react';
import { useSnackbar } from 'notistack';
import styles from './components.module.css';
import Fab from '@mui/material/Fab';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { copyImage } from '@/lib/util';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Grid, { GridBaseProps } from '@mui/material/Grid';
import { ReactElement } from 'react';
import { preload } from 'swr';
import Stack from '@mui/material/Stack';
import Image, { ImageProps } from 'next/image';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import TagRow from './TagRow';
import { PostFetcher } from '@/app/context';
import { Post } from '@/lib/types';

type SlotProps = {
    image?: Omit<ImageProps, 'src' | 'alt'>,
    link?: Omit<Parameters<typeof Link>[0], 'href'>,
    grid?: GridBaseProps,
    container?: GridBaseProps,
}

type ItemProps = {
    slotProps?: SlotProps,
    post: Post,
    prefetch?: boolean,
}

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
                        <Skeleton variant="rectangular" height={250} width={300} sx={{ maxWidth: '100%' }} />
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
                        <Skeleton variant="rectangular" height={150} width={300} sx={{ maxWidth: '100%' }} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}


export function GridPost({
    post,
    slotProps,
    prefetch = true,
    allowCopy = true,
    imageWrapper,
}: {
    post: Post,
    slotProps?: SlotProps,
    prefetch?: boolean,
    allowCopy?: boolean,
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
            height={250}
            width={300}
            unoptimized
            crossOrigin="anonymous"
            loading="eager"
            className={
                (copying ? 'opacity-50 cursor-default ' : '') +
                "object-contain h-[250px] w-full object-center"
            }
            onMouseOver={prefetch ? () => {
                preload('/api/post/' + post.id, PostFetcher);
            } : undefined}
            {...slotProps?.image}
            src={post.imageURL}
            alt={post.id}
        />
    );

    return (
        <div className="group relative">
            {allowCopy &&
                <Fab
                    sx={theme => ({
                        transition: theme.transitions.create('opacity', {
                            duration: theme.transitions.duration.shortest
                        }),
                        position: 'absolute'
                    })}
                    onClick={async () => {
                        if (copying) return;

                        await copyUrl(post.imageURL);
                    }}
                    size="medium"
                    className="left-2 top-2 opacity-0 group-hover:opacity-100">
                    <ContentCopyIcon />
                </Fab>
            }
            <Link
                {...slotProps?.link}
                href={`/post/${post.id}`}
                prefetch={prefetch}
                className="block relative">
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
    slotProps,
    prefetch = true
}: ItemProps) {
    return (
        <Grid container spacing={1} onMouseOver={prefetch ? () => {
            preload('/api/post/' + post.id, PostFetcher);
        } : undefined}>
            <Grid size={4}>
                <Link
                    className="max-w-full"
                    href={`/post/${post.id}`}
                    {...slotProps?.link}>
                    <Image
                        src={post.imageURL}
                        alt={post.id}
                        {...slotProps?.image}
                        height={160}
                        width={160}
                        unoptimized
                        crossOrigin="anonymous"
                        loading="eager"
                        className="w-full min-h-40 object-contain"
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

type PostsProps<E extends Post> = {
    layout: 'grid' | 'list',
    posts: E[] | undefined,
    prefetch?: boolean,
    count?: number,
    allowCopy?: boolean,
    slotProps?: SlotProps,
    wrapper?: (element: ReactElement, post: E) => ReactElement,
};

export default function Posts<E extends Post>({
    layout,
    posts,
    prefetch,
    count,
    allowCopy = true,
    slotProps,
    wrapper
}: PostsProps<E>) {
    if (!posts) {
        if (!count) {
            return <></>
        }
        if (layout === 'grid') {
            return <GridSkeleton count={count} />
        } else {
            return <ListSkeleton count={count} />
        }
    }

    return (
        <Box sx={{ m: 1 }} className='w-full'>
            <Grid
                container
                spacing={2}
                {...slotProps?.container}>
                {
                    layout == 'grid' &&
                    posts.map(post => (
                        <Grid
                            size={{ xs: 12, sm: 6, md: 3 }}
                            {...slotProps?.grid}
                            key={post.id}>
                            <GridPost
                                allowCopy={allowCopy}
                                prefetch={prefetch}
                                slotProps={slotProps}
                                post={post}
                                imageWrapper={(elem) => wrapper?.(elem, post)}
                            />
                        </Grid>
                    ))
                }
                {
                    layout == 'list' &&
                    posts.map(post => (
                        <Grid
                            size={{ xs: 12, sm: 8 }}
                            offset={{ sm: 2 }}
                            {...slotProps?.grid}
                            key={post.id}>
                            <ListPost
                                prefetch={prefetch}
                                slotProps={slotProps}
                                post={post} />
                        </Grid>
                    ))
                }
            </Grid>
        </Box>
    );
}
'use client';

import Stack from '@mui/material/Stack';
import React, { useDeferredValue, useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import _ from 'lodash';
import Grid from '@mui/material/Unstable_Grid2';
import Image from 'next/image';
import Skeleton from '@mui/material/Skeleton';
import Link from 'next/link';
import TagRow from '@/components/TagRow';
import Typography from '@mui/material/Typography';
import CopiableText from '@/components/CopiableText';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { createQueryString } from '@/lib/util';
import { usePosts } from './context';

const pageLimit = 64;

export default function PostList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
    const posts = usePosts((page - 1) * pageLimit, pageLimit);
    const deferredPage = useDeferredValue(Math.ceil((posts.data?.count ?? 0) / pageLimit));

    useEffect(() => {
        setPage(Number(searchParams.get('page') ?? '1'));
    }, [searchParams]);

    if (posts.error) {
        enqueueSnackbar(posts.error, { variant: 'error' });
    }

    return (
        <>
            <Stack alignItems="center" sx={{ m: 2 }}>
                <Typography variant="h4">
                    {
                        posts.data ? <>{posts.data.count} images in total</> : <Skeleton />
                    }
                </Typography>
            </Stack>
            <Grid container spacing={1}>
                {
                    posts.isLoading && posts.data ?
                        _.range(64).map(x => (
                            <Grid key={x} xs={12} md={6}>
                                <Grid container spacing={1}>
                                    <Grid xs={4}>
                                        <Skeleton variant="rectangular" height={150} width={150} />
                                    </Grid>
                                    <Grid xs>
                                        <Stack spacing={1} justifyItems="center">
                                            <Typography>
                                                <Skeleton />
                                            </Typography>
                                            <Typography>
                                                <Skeleton />
                                            </Typography>
                                            <Typography>
                                                <Skeleton />
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )) :
                        posts.data?.data.map(post => (
                            <Grid key={post.id} xs={12} md={6}>
                                <Grid container spacing={1}>
                                    <Grid xs={4}>
                                        <Link href={`/post/${post.id}`}>
                                            <Image
                                                src={post.imageURL!}
                                                alt={post.id}
                                                height={150}
                                                width={150}
                                                style={{
                                                    objectFit: 'contain'
                                                }}
                                            />
                                        </Link>
                                    </Grid>
                                    <Grid xs>
                                        <Stack spacing={1} justifyItems="center">
                                            <CopiableText text={post.id} />
                                            <div>
                                                {post.text ?? <i>Notext</i>}
                                            </div>
                                            <div>
                                                <TagRow tags={post.tags.map(e => e.name)} />
                                            </div>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Grid>
                        ))
                }
            </Grid>

            <Stack alignItems="center" sx={{ m: 4 }}>
                <Pagination
                    disabled={posts.isLoading}
                    count={deferredPage}
                    page={page}
                    onChange={(_, val) => {
                        router.push(createQueryString('/post', {
                            page: val
                        }));
                    }}
                />
            </Stack>
        </>
    );
}
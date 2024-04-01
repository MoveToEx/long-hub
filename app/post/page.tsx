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
import { PostResponse } from '@/lib/types';
import { createQueryString } from '@/lib/util';


const pageLimit = 64;

export default function PostList() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<PostResponse | null>(null);
    const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
    const deferredPage = useDeferredValue(Math.ceil((post?.count ?? 0) / pageLimit));

    useEffect(() => {
        setPage(Number(searchParams.get('page') ?? '1'));
    }, [searchParams]);

    useEffect(() => {
        setLoading(true);

        fetch('/api/post?limit=' + pageLimit + '&offset=' + (page - 1) * 24)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(data => {
                setPost(data);
            })
            .catch(reason => {
                enqueueSnackbar('Failed: ' + reason, { variant: 'error' });
            }).finally(() => {
                setLoading(false);
            });
    }, [page, enqueueSnackbar]);

    return (
        <>
            <Stack alignItems="center" sx={{ m: 2 }}>
                <Typography variant="h4">
                    {
                        post ? <>{post.count} images in total</> : <Skeleton />
                    }
                </Typography>
            </Stack>
            <Grid container spacing={1}>
                {
                    loading ?
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
                        post!.data.map(post => (
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
                    disabled={loading}
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
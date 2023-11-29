'use client';

import Stack from '@mui/material/Stack';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import Image from 'next/image';
import Pagination from '@mui/material/Pagination';
import Link from 'next/link';
import TagRow from '@/components/TagRow';
import { PostsResponse } from '@/lib/types/PostResponse';

const PAGINATION_LIMIT = 64;

function toStack(data: PostsResponse | null) {
    let res = [];
    if (data === null) {
        res = _.range(PAGINATION_LIMIT).map((x: number) => (
            <Grid container key={x.toString()} spacing={2}>
                <Grid xs={4} md={2} mdOffset={2}>
                    <Skeleton variant='rectangular' height={200} />
                </Grid>
                <Grid xs={8} md={6}>
                    <Skeleton variant='text' />
                    <Skeleton variant='text' />
                    <Skeleton variant='text' />
                </Grid>
            </Grid>
        ));
    }
    else {
        res = data.data.map(x => (
            <Grid container key={x.id} spacing={2}>
                <Grid xs={4} md={2} mdOffset={2} sx={{ minHeight: '128px' }}>
                    <Link href={`/post/${x.id}`}>
                        <Image
                            src={x.imageURL}
                            alt={x.id}
                            height={200}
                            width={200}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: '200px',
                                margin: 'auto',
                                objectFit: 'contain'
                            }}
                        />
                    </Link>
                </Grid>
                <Grid xs={8} md={6}>
                    <Stack spacing={1}>
                        <div>
                            {x.id}
                        </div>
                        <div>
                            {x.text.length == 0 ? <i>Notext</i> : x.text}
                        </div>
                        <div>
                            <TagRow tags={x.tags.map(e => e.name)} />
                        </div>
                    </Stack>
                </Grid>
            </Grid>
        ))
    }
    return res;
}

export default function PostList() {
    const [page, setPage] = useState(1);
    const [result, setResult] = useState<PostsResponse | null>(null);

    function onPage(e: React.ChangeEvent<unknown>, val: number) {
        setResult(null);
        setPage(val);
        window.scroll({
            top: 0,
            left: 0
        });
    }

    useEffect(() => {
        fetch('/api/post/?offset=' + (page - 1) * 64 + '&limit=' + PAGINATION_LIMIT)
            .then(x => x.json())
            .then(x => setResult(x));
    }, [page]);

    return (
        <>
            <Stack spacing={1}>
                {toStack(result)}
            </Stack>

            <Stack alignItems="center">
                <Pagination
                    count={result === null ? 0 : Math.ceil(result.count / PAGINATION_LIMIT)}
                    page={page}
                    siblingCount={0}
                    onChange={onPage}
                ></Pagination>
            </Stack>
        </>
    );
}
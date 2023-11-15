'use client';

import Stack from '@mui/material/Stack';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import Image from 'next/image';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import TagIcon from '@mui/icons-material/Tag';
import Link from 'next/link';

const PAGINATION_LIMIT = 64;

function toStack(data: any) {
    let res = [];
    if (_.isEmpty(data)) {
        res = _.range(PAGINATION_LIMIT).map((x: number) => (
            <Grid container key={x.toString()} spacing={2}>
                <Grid xs={4} md={2} mdOffset={2}>
                    <Skeleton variant='rectangular' height='128px' />
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
        res = data.data.map((x: any) => (
            <Grid container key={x.id} spacing={2}>
                <Grid xs={4} md={2} mdOffset={2} sx={{ minHeight: '128px' }}>
                    <Link href={`/post/${x.id}`}>
                        <Image
                            src={x.image}
                            alt={x.id}
                            height={0}
                            width={0}
                            sizes="100vw"
                            style={{
                                width: '100%',
                                maxHeight: '200px',
                                height: 'auto',
                                objectFit: 'contain'
                            }}
                        />
                    </Link>
                </Grid>
                <Grid xs={8} md={6}>
                    <Stack spacing={1}>
                        <p>
                            {x.id}
                        </p>
                        <p>
                            {x.text.length == 0 ? <i>Notext</i> : x.text}
                        </p>
                        <Stack spacing={1} direction="row" display="inline">
                            {x.tags.length == 0
                                ? <i> Untagged </i>
                                : x.tags.map((e: any, i: number) => (
                                    <Link href={'/tag/' + e.name} key={i}>
                                        <Chip label={e.name} sx={{ fontSize: '16px' }} icon={<TagIcon />} />
                                    </Link>
                                ))}
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
        ))
    }
    return res;
}

export default function PostList() {
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({});

    function onPage(e: React.ChangeEvent<unknown>, val: number) {
        setResult({});
        setPage(val);
        window.scroll({
            top: 0,
            left: 0
        });
    }

    useEffect(() => {
        axios.get('/api/post/?offset=' + (page - 1) * 24 + '&limit=' + PAGINATION_LIMIT)
            .then(x => setResult(x.data as any));
    }, [page]);

    return (
        <>
            <Stack spacing={1}>
                {toStack(result)}
            </Stack>

            <Stack alignItems="center">
                <Pagination
                    count={_.isEmpty(result) ? 0 : Math.ceil((result as any).count / PAGINATION_LIMIT)}
                    page={page}
                    siblingCount={0}
                    onChange={onPage}
                ></Pagination>
            </Stack>
        </>
    )
}
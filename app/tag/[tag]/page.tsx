'use client';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import TagIcon from '@mui/icons-material/Tag';
import axios from 'axios';
import _ from 'lodash';
import LinkImageGrid from '@/components/LinkImageGrid';
import { PostsResponse } from '@/lib/types/PostResponse';

const PAGINATION_LIMIT = 24;

export default function SearchPage({
    params
}: {
    params: {
        tag: String
    }
}) {
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
        axios.get('/api/tag/' + params.tag + '?offset=' + ((page - 1) * 24).toString())
            .then(x => setResult(x.data));
    }, [page, params.tag]);

    return (
        <>
            <Typography variant="h3">
                <TagIcon fontSize="large" />
                {params.tag}
            </Typography>

            <LinkImageGrid
                src={result?.data.map(x => ({
                    href: `/post/${x.id}`,
                    src: x.imageURL
                }))}
                gridContainerProps={{
                    spacing: 2
                }}
                gridProps={{
                    xs: 12,
                    sm: 6,
                    md: 3
                }} />

            <Stack alignItems="center">
                <Pagination count={result === null ? 0 : Math.ceil(result.count / PAGINATION_LIMIT)}
                    siblingCount={0}
                    page={page}
                    defaultPage={4}
                    onChange={onPage} />
            </Stack>
        </>
    )
}
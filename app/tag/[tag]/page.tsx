'use client';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import TagIcon from '@mui/icons-material/Tag';
import axios from 'axios';
import _ from 'lodash';
import LinkImageGrid from '@/components/LinkImageGrid';

const PAGINATION_LIMIT = 24;

export default function SearchPage({
    params
}: {
    params: {
        tag: String
    }
}) {
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
        axios.get(process.env.NEXT_PUBLIC_BACKEND_HOST + '/tag/' + params.tag + '?offset=' + ((page - 1) * 24).toString())
            .then(x => setResult(x.data));
    }, [page, params.tag]);

    return (
        <>
            <Typography variant="h3">
                <TagIcon fontSize="large" />
                {params.tag}
            </Typography>

            <LinkImageGrid
                src={_.isEmpty(result) ? null : (result as any).data.map((x: any) => ({
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
                <Pagination count={_.isEmpty(result) ? 0 : Math.ceil((result as any).count / PAGINATION_LIMIT)}
                    siblingCount={0}
                    page={page}
                    defaultPage={4}
                    onChange={onPage} />
            </Stack>
        </>
    )
}
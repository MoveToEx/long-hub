'use client';

import PostGrid from '@/components/PostGridItem';
import _ from 'lodash';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import { useState, useEffect, useDeferredValue } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';
import { useTaggedPost } from '@/app/context';

export default function TagPage({
    params
}: {
    params: {
        tag: string
    }
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
    const { data, isLoading } = useTaggedPost(params.tag, page);
	const deferredPage = useDeferredValue(C.pages(data?.count ?? 0));

    useEffect(() => {
        setPage(Number(searchParams.get('page') ?? '1'));
    }, [searchParams]);

    return (
        <Box sx={{ m: 2 }}>
            <Box sx={{ m: 2 }}>
                <Typography variant="h3">
                    #{params.tag}
                </Typography>
            </Box>
            <Grid container spacing={2}>

                {
                    isLoading &&
                    _.range(24).map(i => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                            <Skeleton variant="rectangular" height={300} sx={{ width: '100%' }} />
                        </Grid>
                    ))
                }

                {
                    !_.isEmpty(data) &&
                    data.data.map(val => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={val.id}>
                            <PostGrid value={val} />
                        </Grid>
                    ))
                }
            </Grid>

            <Stack alignItems="center" sx={{ m: 4 }}>
                <Pagination
                    disabled={isLoading}
                    count={deferredPage}
                    page={page}
                    onChange={(_, val) => {
                        router.push(createQueryString('/tag/' + params.tag, {
                            page: val
                        }));
                    }}
                />
            </Stack>
        </Box>
    );
}
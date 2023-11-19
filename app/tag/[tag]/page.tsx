'use client';

import Image from 'next/image'
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'next/link';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import TagIcon from '@mui/icons-material/Tag';
import axios from 'axios';
import _ from 'lodash';


const PAGINATION_LIMIT = 24;

function toGridItems(res: any) {
    var elem;
    if (_.isEmpty(res)) {
        elem = _.range(PAGINATION_LIMIT).map((x: number) => (
            <>
                <Skeleton variant="rectangular" height={128} />
                <Skeleton variant="text" height={24} />
                <Skeleton variant="text" height={24} />
            </>
        ))
    }
    else {
        elem = res.map((e: any, i: number) => (
            <Link href={`/post/${e.id}`} key={i}>
                <Image
                    src={e.image}
                    alt={e.text}
                    height={0}
                    width={0}
                    sizes='100vw'

                    style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'contain'
                    }}
                />
            </Link>
        ))
    }
    return elem.map((e: any, i: number) => (
        <Grid xs={12} sm={6} md={3} key={i}>
            {e}
        </Grid>
    ));
}

export default function SearchPage({
    params
}: {
    params: {
        tag: String
    }
}) {
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);

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
            
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
                <Alert severity='error' onClose={() => setSnackbarOpen(false)}>
                    Failed when fetching data.
                </Alert>
            </Snackbar>

            <Grid container spacing={2}>
                {toGridItems((result as any).data)}
            </Grid>

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
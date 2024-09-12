'use client';

import _ from 'lodash';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid2';
import Link from 'next/link';
import Skeleton from '@mui/material/Skeleton';
import Image from 'next/image';

import { useState, useEffect, useDeferredValue } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';

interface Template {
    imageURL: string;
    name: string;
    offsetX: number;
    offsetY: number;
    rectHeight: number;
    rectWidth: number;
    style: string | null;
    createdAt: Date
};

interface TemplateResponse {
    count: number;
    data: Template[]
};

export default function Home() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<TemplateResponse | null>(null);
    const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
    const deferredPage = useDeferredValue(C.pages(templates?.count ?? 0));

    useEffect(() => {
        setPage(Number(searchParams.get('page') ?? '1'));
    }, [searchParams]);

    useEffect(() => {
        setLoading(true);

        fetch('/api/template?limit=24&offset=' + (page - 1) * 24)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(data => {
                setTemplates(data);
            })
            .catch(reason => {
                enqueueSnackbar('Failed: ' + reason);
            }).finally(() => {
                setLoading(false);
            });
    }, [page, enqueueSnackbar]);

    return (
        <Box sx={{ m: 2 }}>
            <Grid container spacing={2}>
                {
                    loading && _.range(24).map(i => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i.toString()}>
                            <Skeleton variant="rectangular" height={300} sx={{ width: '100%' }} />
                        </Grid>
                    ))
                }
                {
                    templates && templates.data.map(value => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={value.name}>
                            <Link
                                href={`/template/${value.name}`}
                                style={{
                                    display: 'block',
                                    position: 'relative'
                                }}>
                                <Image
                                    src={value.imageURL}
                                    alt={value.name}
                                    height={300}
                                    width={300}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        width: 'auto',
                                        minWidth: '100%',
                                        minHeight: '100%',
                                        objectFit: 'contain',
                                    }}
                                />
                            </Link>
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
                        router.push(createQueryString('/template', {
                            page: val
                        }), {
                            scroll: false
                        });
                        setPage(val);
                    }}
                />
            </Stack>
        </Box>
    );
}

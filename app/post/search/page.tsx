'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinkImageGrid from '@/components/LinkImageGrid';
import Pagination from '@mui/material/Pagination';
import _ from 'lodash';
import Skeleton from '@mui/material/Skeleton';
import { SearchInput } from './components';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import { useEffect, useState, useDeferredValue } from 'react';
import { useSnackbar } from 'notistack';
import { useRouter, useSearchParams } from 'next/navigation';
import { createQueryString } from '@/lib/util';

import { useSearchResult } from '../context';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [query, setQuery] = useState({
        keyword: [] as string[],
        page: 1
    });
    const result = useSearchResult(query);
    const totalPages = useDeferredValue(C.pages(result.data?.count ?? 0));
    
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const _s = searchParams.get('s');
        setQuery({
            page: Number(searchParams.get('page') ?? '1'),
            keyword: _s ? _s.split(' ') : []
        });
    }, [searchParams]);

    if (result.error) {
        enqueueSnackbar('Failed', { variant: 'error' });
    }

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <SearchInput value={query.keyword} onChange={(_, val) => {
                setQuery({
                    keyword: val,
                    page: 1
                });
                router.push(createQueryString('/post/search', {
                    s: val.join(' ')
                }), {
                    scroll: false
                });
            }} />

            {query.keyword.length != 0 &&
                <Typography variant="h6" align="center">
                    {
                        result.isLoading
                            ? <Skeleton />
                            : <>Found {result.data?.count} result{result.data?.count ?? 0 > 1 ? 's' : ''}</>
                    }
                </Typography>
            }

            {
                !_.isEmpty(query.keyword) &&
                <LinkImageGrid
                    skeleton={result.isLoading ? 24 : 0}
                    src={result.data ? result.data.data.map((x: any) => ({
                        href: `/post/${x.id}`,
                        src: x.imageURL
                    })) : []}
                    gridContainerProps={{
                        spacing: 2
                    }}
                    gridProps={{
                        xs: 12,
                        sm: 6,
                        md: 3
                    }} />
            }

            <Stack alignItems="center" sx={{ m: 4 }}>
                <Pagination
                    disabled={result.isLoading}
                    count={totalPages}
                    page={query.page}
                    onChange={(_, val) => {
                        setQuery({
                            ...query,
                            page: val
                        });
                        router.push(createQueryString('/post/search', {
                            s: query.keyword.join(' '),
                            page: val
                        }), {
                            scroll: false
                        });
                        window.scrollTo({
                            top: 0
                        });
                    }}
                />
            </Stack>

        </Box>
    );
}
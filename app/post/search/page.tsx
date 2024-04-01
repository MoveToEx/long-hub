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
import { useDeferredValue, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useRouter, useSearchParams } from 'next/navigation';
import { createQueryString } from '@/lib/util';
import { PostResponse } from '@/lib/types';

function toOperator(s: string) {
    if (s.startsWith('=')) return 'eq';
    else if (s.startsWith('!=')) return 'ne';
    else if (s.startsWith('>=')) return 'gte';
    else if (s.startsWith('>')) return 'gt';
    else if (s.startsWith('<=')) return 'lte';
    else if (s.startsWith('<')) return 'lt';
    else throw new Error('unknown operator');
}

function startsWith(s: string, ch: string[]) {
    return ch.map(val => s.startsWith(val)).reduce((x, y) => x || y);
}

function transformat(kw: string[]) {
    return kw.map(x => {
        if (startsWith(x, ['+', '-'])) {
            return {
                type: 'tag',
                op: x.startsWith('+') ? 'include' : 'exclude',
                value: _.trimStart(x, '+-')
            }
        }
        else if (startsWith(x, ['>', '<', '!', '='])) {
            return {
                type: 'aggr',
                op: toOperator(x),
                value: Number(_.trimStart(x, '<=>!'))
            }
        }
        else if (x.startsWith('@')) {
            return {
                type: 'id',
                value: _.trimStart(x, '@')
            }
        }
        else {
            return {
                type: 'text',
                value: x
            }
        }
    });
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(searchParams.has('s'));
    const [result, setResult] = useState<PostResponse | null>(null);

    const [query, setQuery] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    
    const totalPages = useDeferredValue(C.pages(result?.count ?? 0));

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        setPage(Number(searchParams.get('page') ?? '1'));
        const _s = searchParams.get('s');
        setQuery(_s ? _s.split(' ') : []);
    }, [searchParams]);
    
    useEffect(() => {
        if (_.isEmpty(query)) {
            setResult(null);
            return;
        }
        setLoading(true);
        const data = JSON.stringify(transformat(query));
        fetch('/api/post/search?limit=24&offset=' + (page - 1) * 24, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        }).then(data => {
            setResult(data);
        }).catch(reason => {
            enqueueSnackbar('Failed: ' + reason, { variant: 'error' });
        }).finally(() => {
            setLoading(false);
        });
    }, [query, enqueueSnackbar, page]);

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <SearchInput value={query} onChange={(_, val) => {
                router.replace(createQueryString('/post/search', {
                    s: val.join(' ')
                }));
                setQuery(val);
                setPage(1);
            }} />
            <Typography variant="h6" align="center">
                {
                    result !== null
                        ? <>Found {result.count} result{result.count > 1 ? 's' : ''}</>
                        : _.isEmpty(query) || <Skeleton />
                }
            </Typography>
            {
                !_.isEmpty(query) &&
                <LinkImageGrid
                    skeleton={loading ? 24 : 0}
                    src={!result ? [] : result.data.map(x => ({
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
            }

            <Stack alignItems="center" sx={{m: 4}}>
                <Pagination
                    disabled={loading}
                    count={totalPages}
                    page={page}
                    onChange={(_, val) => {
                        router.push(createQueryString('/post/search', {
                            s: query.join(' '),
                            page: val
                        }));
                    }}
                />
            </Stack>

        </Box>
    );
}
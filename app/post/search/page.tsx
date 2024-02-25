'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinkImageGrid from '@/components/LinkImageGrid';
import Pagination from '@mui/material/Pagination';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import Skeleton from '@mui/material/Skeleton';
import { SearchInput } from './components';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useRouter, useSearchParams } from 'next/navigation';
import { createQueryString } from '@/lib/util';

interface Post {
    id: string;
    text: string;
    image: string;
    imageHash: string;
    imageURL: string;
}

interface PostResponse {
    count: number;
    data: Post[]
}

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

    const [result, setResult] = useState<PostResponse | null>(null);
    const [query, setQuery] = useState<string[]>(searchParams?.get('s')?.split(' ') ?? []);
    const [page, setPage] = useState<number>(1);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (_.isEmpty(query)) {
            setResult(null);
            return;
        }
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
            enqueueSnackbar(reason as string, { variant: 'error' });
        });
    }, [query, enqueueSnackbar, page]);

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <SearchInput value={query} onChange={(_, val) => {
                router.replace(createQueryString('/post/search', {
                    s: val.join(' ')
                }));
                setPage(1);
                setQuery(val);
                setResult(null);
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
                    skeleton={result === null ? 24 : 0}
                    src={result === null ? [] : result.data.map(x => ({
                        href: `/post/${x.id}`,
                        src: x.imageURL!
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

            <Stack alignItems="center">
                <Pagination
                    disabled={result === null}
                    count={result === null ? 0 : C.pages(result.count)}
                    page={page}
                    onChange={(_, val) => {
                        setPage(val);
                        setResult(null);
                    }}
                />
            </Stack>

        </Box>
    );
}
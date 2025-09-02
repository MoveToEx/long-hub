'use client';

import _ from 'lodash';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Posts from '@/components/Posts';
import Skeleton from '@mui/material/Skeleton';
import { SearchInput, QueryReference } from './components';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import { useState, useDeferredValue } from 'react';
import { useSnackbar } from 'notistack';

import { useSearchResult } from '@/app/context';
import { useSyncedSearchParams } from '@/lib/hooks';
import ToggleLayout from '@/components/list/ToggleLayout';
import { parseQuery } from './utils';

export default function SearchPage() {
    const [params, setParams] = useSyncedSearchParams({
        order: {
            defaultValue: '+id',
            parser: value => value,
            serializer: value => value
        },
        keyword: {
            defaultValue: [] as string[],
            parser: value => value === '' ? [] : value.split(' '),
            serializer: value => value.join(' ')
        },
        page: {
            defaultValue: 1,
            parser: value => Number(value),
            serializer: value => value.toString()
        }
    });

    const [layout, setLayout] = useState<'grid' | 'list'>('grid');

    const result = useSearchResult(parseQuery(params.keyword, params.order, params.page));
    const totalPages = useDeferredValue(C.pages(result.data?.count ?? 0));

    const { enqueueSnackbar } = useSnackbar();

    if (result.error) {
        enqueueSnackbar('Failed', { variant: 'error' });
    }

    return (
        <Box className='flex-1 self-start'>
            <SearchInput value={params.keyword} onChange={(_, val) => {
                setParams({
                    keyword: val,
                    page: 1
                })
            }} />

            <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Sort by</InputLabel>
                        <Select
                            MenuProps={{
                                disableScrollLock: true
                            }}
                            value={params.order}
                            label="Sort by"
                            onChange={(event) => {
                                setParams({
                                    order: event.target.value
                                });
                            }}>
                            <MenuItem value="+id">ID ascending</MenuItem>
                            <MenuItem value="-id">ID descending</MenuItem>
                            <MenuItem value="+createdAt">createdAt ascending</MenuItem>
                            <MenuItem value="-createdAt">createdAt descending</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid className="flex justify-end items-end" size={{
                    xs: 12,
                    md: 'grow'
                }}>
                    <ToggleLayout value={layout} onChange={val => setLayout(val)} />
                </Grid>

            </Grid>

            {!_.isEmpty(params.keyword) &&
                <div className="flex flex-col justify-center items-center">
                    {
                        result.isLoading &&
                        <Skeleton>
                            <Typography variant="h6">Found nn results</Typography>
                        </Skeleton>
                    }
                    {
                        result.data &&
                        <Typography variant="h6">
                            Found {result.data.count} result{result.data.count > 1 ? 's' : ''}
                        </Typography>
                    }

                    <Posts
                        count={24}
                        layout={layout}
                        posts={result.data?.data} />

                    <Stack alignItems="center" sx={{ my: 4 }}>
                        <Pagination
                            disabled={result.isLoading}
                            count={totalPages}
                            page={params.page}
                            onChange={(_, val) => {
                                setParams({
                                    page: val
                                });
                                window.scrollTo({
                                    top: 0
                                });
                            }}
                        />
                    </Stack>
                </div>
            }

            {_.isEmpty(params.keyword) && <QueryReference />}
        </Box>
    );
}
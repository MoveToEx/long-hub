'use client';

import _ from 'lodash';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Posts from '@/components/Posts';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import WindowIcon from '@mui/icons-material/Window';
import ViewListIcon from '@mui/icons-material/ViewList';
import Skeleton from '@mui/material/Skeleton';
import { SearchInput, QueryReference } from './components';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import { useState, useDeferredValue } from 'react';
import { useSnackbar } from 'notistack';

import { useSearchResult, SearchQuery } from '@/app/context';
import { useSearchParam } from '@/lib/hooks';

function parseRating(s: string) {
    if (s == 'n') return 'none';
    else if (s == 'm') return 'moderate';
    else if (s == 'v') return 'violent';
    return s;
}

function startsWith(s: string, ch: string[]) {
    return ch.map(val => s.startsWith(val)).reduce((x, y) => x || y);
}

function parseFilter(params: string[]) {
    return params.map(s => {
        if (startsWith(s, ['+', '-'])) {
            return {
                type: 'tag',
                op: s.startsWith('+') ? 'include' : 'exclude',
                value: _.trimStart(s, '+-')
            }
        }
        if (s.indexOf(':') === -1) {
            return {
                type: 'text',
                op: 'contains',
                value: s
            }
        }
        const [field, value] = s.split(':', 2);
        if (field == 'rating' || field == 'r') {
            return {
                type: 'rating',
                value: parseRating(value)
            }
        }
        else if (field == 'uploader' || field == 'up') {
            return {
                type: 'uploader',
                op: 'is',
                value
            }
        }
        else if (field == 'id') {
            return {
                type: 'id',
                op: 'contains',
                value
            }
        }
        else if (field == 'system' || field == 'sys') {
            return {
                type: 'system',
                op: value
            }
        }
        else {
            return {
                type: 'text',
                op: 'contains',
                value: s
            }
        }
    });
}

function parseQuery(keyword: string[], order: string, page: number) {
    const filter = parseFilter(keyword);
    const key = order.slice(1);
    const direction = order.startsWith('-') ? 'desc' : 'asc';

    return {
        filter,
        page,
        order: { key, direction }
    } as SearchQuery;
}

export default function SearchPage() {
    const [order, setOrder] = useSearchParam('o', '+id');
    const [keyword, setKeyword] = useSearchParam('s', [], val => val.split(' '));
    const [page, setPage] = useSearchParam('p', 1, val => Number(val));

    const [layout, setLayout] = useState<'grid' | 'list'>('grid');

    const result = useSearchResult(parseQuery(keyword, order, page));
    const totalPages = useDeferredValue(C.pages(result.data?.count ?? 0));

    const { enqueueSnackbar } = useSnackbar();

    if (result.error) {
        enqueueSnackbar('Failed', { variant: 'error' });
    }

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <SearchInput value={keyword} onChange={(_, val) => {
                setKeyword(val);
                setPage(1);
            }} />

            <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Sort by</InputLabel>
                        <Select
                            MenuProps={{
                                disableScrollLock: true
                            }}
                            value={order}
                            label="Sort by"
                            onChange={(event) => {
                                setOrder(event.target.value);
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
                    <ToggleButtonGroup size="small" value={layout} exclusive onChange={(event, value) => {
                        if (value !== null) {
                            setLayout(value);
                        }
                    }}>
                        <Tooltip title="Grid layout">
                            <ToggleButton value="grid">
                                <WindowIcon />
                            </ToggleButton>
                        </Tooltip>
                        <Tooltip title="List layout">
                            <ToggleButton value="list">
                                <ViewListIcon />
                            </ToggleButton>
                        </Tooltip>
                    </ToggleButtonGroup>
                </Grid>

            </Grid>

            {
                !_.isEmpty(keyword) &&
                <>
                    <div className="flex justify-center items-center">
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
                    </div>

                    <Posts
                        skeleton={24}
                        layout={layout}
                        posts={result.data?.data} />

                    <Stack alignItems="center" sx={{ m: 4 }}>
                        <Pagination
                            disabled={result.isLoading}
                            count={totalPages}
                            page={page}
                            onChange={(_, val) => {
                                setPage(val);
                                window.scrollTo({
                                    top: 0
                                });
                            }}
                        />
                    </Stack>

                </>
            }

            {
                _.isEmpty(keyword) && <QueryReference />
            }
        </Box>
    );
}
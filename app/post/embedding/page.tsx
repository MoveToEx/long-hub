'use client';

import Posts from '@/components/Posts';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import { useState } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { vSearch } from './actions';
import TextField from '@mui/material/TextField';
import useSWR from 'swr';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const { isLoading, error, data } = useSWR(['__action_vSearch', query], ([_, q]) => q ? vSearch(q) : undefined);

    if (error) {
        return <span>Failed when fetching</span>
    }

    return (
        <Box sx={{ m: 2 }}>
            <TextField
                sx={{ mb: 2 }}
                disabled={isLoading}
                fullWidth
                label={<span><AutoAwesomeIcon /> Search by text embedding similarity</span>}
                onKeyDown={e => {
                    if (e.key == 'Enter') {
                        setQuery((e.target as HTMLInputElement).value);
                    }
                }}
            />
            {query &&
                <Posts
                    count={8}
                    layout='grid'
                    posts={data}
                    wrapper={(elem, post) => (
                        <Badge
                            badgeContent={(1 - post.difference).toFixed(2)}
                            color="primary"
                            className="w-full"
                            sx={{
                                '& .MuiBadge-badge': {
                                    top: 20,
                                    right: 20,
                                }
                            }}>
                            {elem}
                        </Badge>
                    )} />}
        </Box>
    );
}
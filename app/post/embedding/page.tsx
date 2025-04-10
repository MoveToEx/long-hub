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
import Badge from '@mui/material/Badge';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import WindowIcon from '@mui/icons-material/Window';
import ViewListIcon from '@mui/icons-material/ViewList';
import Box from '@mui/material/Box';
import { useState } from 'react';
import { useSnackbar } from 'notistack';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { vSearch } from './actions';
import TextField from '@mui/material/TextField';
import useSWR from 'swr';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const result = useSWR(['__action_vSearch', query], ([_, q]) => q ? vSearch(q) : null);

    const { enqueueSnackbar } = useSnackbar();

    if (result.error) {
        enqueueSnackbar(result.error, { variant: 'error' });
    }

    return (
        <Box sx={{ mt: 2, mb: 2 }}>
            <TextField
                sx={{ mb: 2 }}
                disabled={result.isLoading}
                fullWidth
                label={<span><AutoAwesomeIcon /> Search by text embedding similarity</span>}
                onKeyDown={e => {
                    if (e.key == 'Enter') {
                        setQuery((e.target as HTMLInputElement).value);
                    }
                }}
            />
            {
                result.isLoading && (
                    <Posts layout='grid' skeleton={8} />
                )
            }
            {
                result.data && (
                    <Posts
                        layout='grid'
                        posts={result.data}
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
                        )}
                    />
                )
            }
        </Box>
    );
}
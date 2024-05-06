'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import _ from 'lodash';
import Skeleton from '@mui/material/Skeleton';

export default function Loading() {
    return (
        <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
            <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={300} />
            </Grid>
            <Grid item xs={12} md={8} sx={{ mt: '16px' }}>
                <Stack alignItems="right" spacing={1}>
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                </Stack>
            </Grid>
        </Grid>
    );
}
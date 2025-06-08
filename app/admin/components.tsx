'use client';

import MUIPagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { usePathname, useSearchParams, useSelectedLayoutSegment } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';
import _ from 'lodash';
import { ComponentType, ReactNode, useState, Suspense } from 'react';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import Typography from '@mui/material/Typography';
import { Configuration } from '@/lib/config';

export function Pagination({
    page,
    count
}: {
    page: number,
    count: number
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    return (
        <Stack alignItems="center">
            <MUIPagination
                shape="rounded"
                count={count}
                page={page}
                onChange={(_, v) => {
                    router.push(createQueryString(pathname, {
                        ...[...searchParams.entries()].reduce((a, x) => ({
                            ...a,
                            [x[0]]: x[1]
                        }), {}),
                        page: v
                    }));
                }} />
        </Stack>
    )
}

export function ResponsivePaper({
    children
}: {
    children: ReactNode
}) {
    return (
        <Paper
            sx={theme => ({
                overflowX: 'auto',
                my: 2,
                [theme.breakpoints.down('md')]: {
                    my: 0,
                    '&.MuiPaper-elevation1': {
                        boxShadow: 'none'
                    }
                }
            })}>
            {children}
        </Paper>
    )
}

export function TabSkeleton() {
    return (
        <div>
            <Box sx={{ my: 2 }}>
                <Typography variant='h5'>
                    <Skeleton width='75%' />
                    <Skeleton width='35%' />
                </Typography>
            </Box>
            <Grid container gap={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Skeleton variant='rectangular' height={300} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} className='flex flex-col'>
                    <Skeleton className='flex-0' variant='text' width={350} />
                    <Skeleton className='flex-0' variant='text' width={200} />
                    <Skeleton className='flex-0' variant='text' width={350} />
                    <Skeleton className='flex-0' variant='text' width={200} />
                    <Skeleton className='flex-0' variant='text' width={350} />
                </Grid>
            </Grid>
        </div>
    )
}



export function PanelTabs({
    slot,
    titles
}: {
    slot: ReactNode,
    titles: string[]
}) {
    const router = useRouter();
    const selected = useSelectedLayoutSegment('tabs');

    return (
        <Box>
            <Box>
                <Tabs
                    value={titles.indexOf(selected ?? '')}
                    variant='scrollable'
                    scrollButtons='auto'
                    onChange={(_, newValue) => {
                        router.push(titles[newValue]);
                    }}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    {
                        titles.map(value => (
                            <Tab label={value} key={value} />
                        ))
                    }
                </Tabs>
            </Box>
            <Box sx={{ p: 2 }}>
                {slot}
            </Box>
        </Box>
    );
}
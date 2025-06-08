'use client';

import MUIPagination from '@mui/material/Pagination';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';
import { LinePlot } from '@mui/x-charts/LineChart';
import { ChartsLegend, ChartsTooltip, ChartsXAxis, ChartsYAxis, ChartContainer } from '@mui/x-charts';
import { PiePlot } from '@mui/x-charts';
import _ from 'lodash';
import { ReactNode } from 'react';
import { eachDayOfInterval, isSameDay, subDays } from 'date-fns';

export function ContributionChart({ data }: {
    data: {
        value: number,
        label: string
    }[]
}) {
    return (
        <ChartContainer
            height={300}
            series={[
                {
                    type: 'pie',
                    data,
                    innerRadius: 75,
                    outerRadius: 100
                }
            ]}>
            <PiePlot />
            <ChartsTooltip trigger='item' />
            <ChartsLegend direction='vertical' />
        </ChartContainer>
    )
}

export function NewPostChart({ data }: {
    data: {
        date: Date,
        count: number
    }[]
}) {
    const dateRange = eachDayOfInterval({
        start: subDays(new Date(), 28),
        end: new Date()
    });

    const series = dateRange.map((value) => {
        return data
            .filter(item => isSameDay(item.date, value))
            .map(item => Number(item.count))
            .reduce((a, b) => a + b, 0);
    });

    return (
        <ChartContainer
            height={300}
            series={[{
                type: 'line',
                data: series,
            }]}
            xAxis={[{
                scaleType: 'time',
                data: dateRange,
                valueFormatter: value => (value as Date).toLocaleDateString()
            }]}>
            <LinePlot />
            <ChartsXAxis />
            <ChartsYAxis />
            <ChartsTooltip />
        </ChartContainer>
    )
}


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

'use client';

import MUIPagination from '@mui/material/Pagination';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';

import Stack from '@mui/material/Stack';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';
import { LinePlot } from '@mui/x-charts/LineChart';
import { ChartsLegend, ChartsTooltip, ChartsXAxis, ChartsYAxis, ResponsiveChartContainer } from '@mui/x-charts';
import { PiePlot } from '@mui/x-charts';
import _ from 'lodash';
import { ReactNode, useState } from 'react';
import { eachDayOfInterval, isSameDay, subDays } from 'date-fns';

export function ContributionChart({ data }: {
    data: {
        value: number,
        label: string
    }[]
}) {
    return (
        <ResponsiveChartContainer
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
            <ChartsLegend
                direction='column'
                position={{
                    vertical: 'middle',
                    horizontal: 'left'
                }}
                padding={2} />
        </ResponsiveChartContainer>
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
        <ResponsiveChartContainer
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
        </ResponsiveChartContainer>
    )
}

function TabPanel(props: {
    children?: ReactNode,
    value: number,
    index: number
}) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={index !== value} {...other}>
            {index === value && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    )
}

export function PanelTabs({
    slots,
    titles
}: {
    slots: ReactNode[],
    titles: string[]
}) {
    const [value, setValue] = useState(0);
    return (
        <Box>
            <Box>
                <Tabs
                    value={value}
                    onChange={(_, newValue) => setValue(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    {
                        titles.map(value => (
                            <Tab label={value} key={value} />
                        ))
                    }
                </Tabs>
            </Box>
            {
                slots.map((children, index) => (
                    <TabPanel value={value} index={index} key={index}>
                        {children}
                    </TabPanel>
                ))
            }
        </Box>
    );
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
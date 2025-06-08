'use client';

import { LinePlot } from '@mui/x-charts/LineChart';
import { ChartsLegend, ChartsTooltip, ChartsXAxis, ChartsYAxis, ChartContainer } from '@mui/x-charts';
import { PiePlot } from '@mui/x-charts';
import _ from 'lodash';
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

'use client';

import MUIPagination from '@mui/material/Pagination';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
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

import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { Configuration } from '@/lib/config';
import { setConfig } from '../actions';
import { useSnackbar } from 'notistack';

type ConfDescItem = {
    description: string;
} & ({
    type: 'boolean';
} | {
    type: 'string';
} | {
    type: 'select';
    select: string[]
} | {
    type: 'number';
} | {
    type: 'slider';
    max: number;
    min: number;
});

export type ConfDesc = {
    [K in keyof Configuration]: ConfDescItem
};

type ConfMapping = {
    boolean: boolean;
    string: string;
    select: string;
    number: number;
    slider: number;
}

const confs: ConfDesc = {
    allowRegistration: {
        type: 'boolean',
        description: 'Whether to allow for new user registration'
    },
    maxUploadRate: {
        type: 'number',
        description: 'Maximum allowed uploads per minute per user',
    },
    defaultPermission: {
        type: 'number',
        description: 'Permission granted to new users'
    },
    uploadSessionExpiration: {
        type: 'number',
        description: 'Maximum time an upload session can remain valid, in seconds'
    }
};

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

function ItemDescription({
    title,
    description
}: {
    title: string,
    description: string
}) {
    return (
        <Box className="flex flex-col">
            <Typography>
                {title}
            </Typography>
            <Typography variant="caption" color='textSecondary'>
                {description}
            </Typography>
        </Box>
    )
}

export function BooleanItem({
    value,
    onChange,
}: {
    value: boolean,
    onChange: (val: boolean) => Promise<void>
}) {
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    return (
        <Switch
            onChange={async (_, val) => {
                setLoading(true);
                try {
                    await onChange(val);
                    enqueueSnackbar('Value updated', { variant: 'success' });
                }
                catch (e) {
                    enqueueSnackbar('Failed when updating value: ' + String(e), { variant: 'error' });
                }
                setLoading(false);
            }}
            disabled={loading}
            checked={value} />
    );
}

export function NumberItem({
    value,
    onChange,
}: {
    value: number,
    onChange: (val: number) => Promise<void>
}) {
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState(value.toString());
    const { enqueueSnackbar } = useSnackbar();
    return (
        <TextField
            disabled={loading}
            type='number'
            variant='standard'
            value={input}
            onKeyDown={async (event) => {
                if (event.key == 'Enter') {
                    setLoading(true);
                    try {
                        await onChange(parseInt(input));
                        enqueueSnackbar('Value updated', { variant: 'success' });
                    }
                    catch (e) {
                        enqueueSnackbar('Failed when updating value: ' + String(e), { variant: 'error' });
                    }
                    setLoading(false);
                }
            }}
            onChange={(event) => {
                setInput(event.currentTarget.value);
            }} />
    );
}

export function ConfigItem<T extends keyof ConfMapping>({
    itemKey,
    type,
    description,
    value
}: {
    itemKey: keyof Configuration,
    type: T,
    description: string,
    value: ConfMapping[T]
}) {
    return (
        <Box
            sx={{
                px: {
                    md: 2,
                    xs: 0,
                },
                py: 0.5
            }}
            className="flex flex-row justify-between items-center">
            <ItemDescription title={itemKey} description={description} />
            {type === 'boolean' && (
                <BooleanItem
                    onChange={async (val) => {
                        await setConfig(itemKey, val);
                    }}
                    value={value as boolean} />
            )}
            {type === 'number' && (
                <NumberItem
                    onChange={async (val) => {
                        await setConfig(itemKey, val);
                    }}
                    value={value as number} />
            )}
        </Box>
    )
}


export function ConfigItems({
    conf
}: {
    conf: Configuration
}) {
    const elem = [];
    for (const k in conf) {
        const key: keyof Configuration = k as keyof Configuration;
        elem.push(
            <ConfigItem
                key={key}
                itemKey={key}
                type={confs[key].type}
                description={confs[key].description}
                value={conf[key]} />
        )
    }
    return elem;
}
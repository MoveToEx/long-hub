'use client';

import MUIPagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';
import { LineChart } from '@mui/x-charts/LineChart';
import _ from 'lodash';


export function NewPostChart({ count }: { count: number[] }) {
    const date = new Date().getDate();
    const dates = _.rangeRight(count.length).map(val => new Date(new Date().setDate(date - val)).getDate());
    return (
        <LineChart
            xAxis={[
                {
                    scaleType: 'band',
                    data: dates,
                }
            ]}
            series={[{ data: count }]}
            width={1000}
            height={300}
        />
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
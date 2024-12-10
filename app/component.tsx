'use client';

import { SparkLineChart } from "@mui/x-charts/SparkLineChart";
import { getContribution, getPostsCount, getRandomPost } from "./actions";
import useSWR from "swr";
import Skeleton from "@mui/material/Skeleton";
import Grid from '@mui/material/Grid2';
import _ from 'lodash';
import { useEffect, useMemo, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from "next/link";
import Image from 'next/image';
import style from './page.module.css';
import { usePosts } from "./context";
import PostGridItem from "@/components/PostGridItem";

export function NewPostChart({
    height
}: {
    height: number
}) {
    const data = useSWR('__action_getPostsCount', () => getPostsCount());
    const serial = useMemo(() => {
        if (!data.data) return null;

        const result = _.range(-28, 1).map(value => {
            const date = new Date();
            date.setUTCHours(0, 0, 0, 0);
            date.setDate(date.getDate() + value);
            return { date, count: 0 };
        });

        let i = 0, j = 0;

        while (j < result.length && i < data.data.length) {
            if (data.data[i].date.getTime() == result[j].date.getTime()) {
                result[j].count = Number(data.data[i].count);
                ++i
            }
            ++j;
        }

        return result;
    }, [data]);

    if (data.isLoading || !serial) {
        return (
            <Skeleton height={height} />
        )
    }

    if (!data.data) {
        return (
            <span> Failed to fetch </span>
        )
    }

    return (
        <SparkLineChart
            data={serial.map(value => Number(value.count))}
            xAxis={{
                scaleType: 'time',
                data: serial.map(value => value.date),
                valueFormatter: value => value.toISOString().slice(0, 10)
            }}
            height={height}
            showTooltip />
    )
}

export function RandomPostGrid() {
    const [randomPost, setRandomPost] = useState<{
        id: string,
        text: string,
        imageURL: string
    }[]>([]);

    useEffect(() => {
        (async () => {
            const result = await getRandomPost();
            setRandomPost(result);
        })();
    }, []);

    if (randomPost.length == 0) {
        return (
            <Grid container spacing={1}>
                <Grid size={6}>
                    <Skeleton height={128} />
                </Grid>
                <Grid size={6}>
                    <Skeleton height={128} />
                </Grid>
                <Grid size={6}>
                    <Skeleton height={128} />
                </Grid>
                <Grid size={6}>
                    <Skeleton height={128} />
                </Grid>
            </Grid>
        )
    }

    return (
        <Grid container spacing={1}>
            {
                randomPost.map(post => (
                    <Grid size={6} key={post.id}>
                        <Link
                            href={`/post/${post.id}`}
                            className="block relative">
                            <Image
                                src={post.imageURL}
                                alt={post.text}
                                height={128}
                                width={128}
                                unoptimized
                                crossOrigin="anonymous"
                                loading="eager"
                                className="object-contain h-32 w-full"
                            />
                        </Link>
                    </Grid>
                ))
            }
        </Grid>
    )
}

export function ContributionChart() {
    const data = useSWR('__action', () => getContribution());
    const activities = useMemo(() => {
        if (!data.data) {
            return null;
        }

        const list = _.range(-7 * 52, 0).map(value => {
            const date = new Date();
            date.setUTCHours(0, 0, 0, 0);
            date.setDate(date.getDate() + value);
            return { date, count: 0, div: 0 };
        });
        const max = data.data.reduce((prev, curr) => Math.max(prev, Number(curr.count)), 0);

        if (max === 0) return list;

        let i = 0, j = 0;

        while (i < list.length && j < data.data.length) {
            if (list[i].date.getTime() == data.data[j].date.getTime()) {
                list[i].div = Math.ceil(Number(data.data[j].count) / max * 4);
                list[i].count = Number(data.data[j].count);
                j++;
            }
            i++;
        }
        return list;
    }, [data]);

    if (data.error) {
        return <span>Failed to fetch</span>
    }

    if (data.data === null) {
        return (
            <Box className="w-full flex flex-row justify-center items-baseline">
                <Button component={Link} href="/account/login" variant="outlined" sx={{ m: 2 }}>
                    Log in
                </Button>
                <span>
                    to see your contribution
                </span>
            </Box>
        )
    }

    if (activities === null) {
        return <Skeleton sx={{ width: '100%', height: '100%' }} />
    }

    const from = new Date();
    from.setUTCHours(0, 0, 0, 0);
    const to = new Date(from);

    from.setDate(from.getDate() - 7 * 52);

    return (
        <CalendarHeatmap
            startDate={from}
            endDate={to}
            showMonthLabels={false}
            classForValue={(value) => {
                if (!value) {
                    return style['contribution-grid-0'];
                }
                return style[`contribution-grid-${value.div}`];
            }}
            values={activities}
        />
    )
}

export function RecentPosts() {
    const { isLoading, data } = usePosts(4);
    return (
        <Grid container spacing={2}>
            {
                isLoading && _.range(4).map(i => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i.toString()}>
                        <Skeleton variant="rectangular" height={300} sx={{ width: '100%' }} />
                    </Grid>
                ))
            }
            {
                data && data.data.map(post => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={post.id}>
                        <PostGridItem value={post} />
                    </Grid>
                ))
            }
        </Grid>
    )
}
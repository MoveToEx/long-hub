
import { prisma } from "@/lib/db";
import { auth } from '@/lib/dal';

import { notFound } from "next/navigation";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid2';
import Divider from '@mui/material/Divider';

import SettingsIcon from '@mui/icons-material/Settings';

import * as C from '@/lib/constants';
import { NewPostChart, PanelTabs } from './components';
import _ from "lodash";
import Link from "next/link";
import { Prisma, RequestStatus } from "@prisma/client";
import { ContributionChart } from "./components";

async function PostTab() {
    const contribution: {
        name: string,
        count: bigint
    }[] = await prisma.$queryRaw(Prisma.sql`
        SELECT "user"."name" AS "name", COUNT(*) AS "count" FROM "post"
        INNER JOIN "user" ON "post"."uploaderId" = "user"."id"
        WHERE "post"."createdAt" >= NOW() - INTERVAL '28 days' AND "deletedAt" is NULL
        GROUP BY "user"."id"`);

    const series: {
        date: Date,
        count: bigint
    }[] = await prisma.$queryRaw(Prisma.sql`
        SELECT "createdAt"::DATE AS "date", COUNT(*) AS "count"
        FROM post
        WHERE "createdAt" > NOW() - INTERVAL '28 days' AND "deletedAt" IS NULL
        GROUP BY date
        ORDER BY date ASC`);

    const vec: { indexed: BigInt, total: BigInt }[] = await prisma.$queryRaw`
        SELECT COUNT(*) as total,
        COUNT(*) FILTER (WHERE "text_embedding" IS NOT NULL) AS indexed
        FROM post
        WHERE "text" <> ''`;

    const count = await prisma.post.count({
        where: {
            deletedAt: null
        }
    });

    return (
        <Box>
            <Box className="flex justify-between">
                <Typography variant='h5'>
                    Posts
                </Typography>
                <Button
                    variant='contained'
                    startIcon={<SettingsIcon />}
                    LinkComponent={Link}
                    href="/admin/posts">
                    MANAGE
                </Button>
            </Box>
            <Typography>
                {count} posts in total, {vec[0].indexed.toString()} / {vec[0].total.toString()} indexed by vector db
            </Typography>

            <Grid container>
                <Grid size={{ md: 6, xs: 12 }}>
                    <ContributionChart
                        data={contribution.map(item => ({
                            label: item.name,
                            value: Number(item.count),
                        }))} />
                </Grid>

                <Grid size={{ md: 6, xs: 12 }}>
                    <NewPostChart data={series.map(item => ({
                        count: Number(item.count),
                        date: item.date
                    }))} />
                </Grid>
            </Grid>

        </Box>
    )
}

async function TagTab() {
    const tags = await prisma.tag.findMany({
        take: 12,
        include: {
            _count: {
                select: {
                    posts: {
                        where: {
                            deletedAt: null
                        }
                    }
                }
            }
        },
        orderBy: [
            {
                posts: {
                    _count: 'desc'
                }
            },
            {
                id: 'asc'
            }
        ]
    });
    const count = await prisma.tag.count();

    return (
        <Box>
            <Box className="flex justify-between">
                <Typography variant='h5'>
                    Tags
                </Typography>
                <Button
                    variant='contained'
                    startIcon={<SettingsIcon />}
                    LinkComponent={Link}
                    href="/admin/tags">
                    MANAGE
                </Button>
            </Box>
            <Typography>
                {count} tags in total.
            </Typography>
            <TableContainer sx={{ height: '500px', overflowY: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">#</TableCell>
                            <TableCell align="center">Name</TableCell>
                            <TableCell align="center">Posts</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            tags.map(tag => (
                                <TableRow key={tag.id}>
                                    <TableCell align="center">{tag.id}</TableCell>
                                    <TableCell align="center">{tag.name}</TableCell>
                                    <TableCell align="center">{tag._count.posts}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

async function UserTab() {
    const count = await prisma.user.count();
    const user = await prisma.user.findMany({
        take: 12,
        orderBy: [
            {
                createdAt: 'desc',
            },
            {
                id: 'asc'
            }
        ]
    });
    return (
        <Box>
            <Box className="flex justify-between">
                <Typography variant='h5'>
                    Users
                </Typography>
                <Button
                    variant='contained'
                    startIcon={<SettingsIcon />}
                    LinkComponent={Link}
                    href="/admin/users">
                    MANAGE
                </Button>
            </Box>
            <Typography>
                {count} users in total.
            </Typography>
            <TableContainer sx={{ height: '500px', overflowY: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">#</TableCell>
                            <TableCell align="center">Username</TableCell>
                            <TableCell align="center">Permission</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            user.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell align="center">{user.id}</TableCell>
                                    <TableCell align="center">{user.name}</TableCell>
                                    <TableCell align="center">{user.permission.toString(16)}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    );
}

async function DelTab() {
    const [count, deletedPostCount, processedRequestCount] = await prisma.$transaction([
        prisma.deletion_request.count({
            where: {
                status: RequestStatus.pending
            }
        }),
        prisma.post.count({
            where: {
                deletedAt: {
                    not: null
                }
            }
        }),
        prisma.deletion_request.count({
            where: {
                status: {
                    not: RequestStatus.pending
                }
            }
        })
    ]);

    return (
        <Box>
            <Box className="flex flex-wrap justify-between">
                <Typography variant='h5'>
                    Deletion
                </Typography>
                <Button
                    variant='contained'
                    startIcon={<SettingsIcon />}
                    LinkComponent={Link}
                    href="/admin/deletion_requests">
                    MANAGE
                </Button>
            </Box>

            <Box className="flex flex-wrap flex-row items-center content-center h-32">
                <Box className="flex flex-1 text-center flex-col items-center">
                    <Typography variant="h4" component="span">
                        {count}
                    </Typography>
                    <Typography variant="button">
                        pending
                    </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box className="flex flex-1 text-center flex-col items-center">
                    <Typography variant="h4" component="span">
                        {deletedPostCount}
                    </Typography>
                    <Typography variant="button">
                        deleted
                    </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box className="flex flex-1 text-center flex-col items-center">
                    <Typography variant="h4" component="span">
                        {processedRequestCount}
                    </Typography>
                    <Typography variant="button">
                        processed
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}


export default async function AdminPage() {
    const user = await auth();

    if (!user || (user.permission & C.Permission.Admin.base) == 0) {
        notFound();
    }

    return (
        <Box>
            <Paper
                sx={{
                    my: 2,
                    overflowX: 'auto',
                }}>
                <PanelTabs
                    titles={['post', 'user', 'tag', 'deletion']}
                    slots={[
                        <PostTab key="post" />,
                        <UserTab key="user" />,
                        <TagTab key="tag" />,
                        <DelTab key="req" />
                    ]}
                />
            </Paper>
        </Box>
    )
}
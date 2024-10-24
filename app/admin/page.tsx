
import { prisma } from "@/lib/db";
import { authByCookies } from "@/lib/server-util";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button, { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';

import Tooltip from '@mui/material/Tooltip';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import SettingsIcon from '@mui/icons-material/Settings';

import * as C from '@/lib/constants';

import { DeletePost } from "./posts/actions";
import { DeleteUser, ResetAccessKey } from "./users/actions";
import { NewPostChart, PostContributionChart } from './components';
import _ from "lodash";
import Link from "next/link";
import Image from "next/image";

const MAX_DATE_DIF = 28;

type Contribution = Record<string, number>;

function FlexEndButton(props: ButtonProps) {
    return (
        <Grid container sx={{ justifyContent: 'flex-end' }}>
            <Grid>
                <Button {...props} />
            </Grid>
        </Grid>
    )
}


export default async function AdminPage() {
    const user = await authByCookies();

    if (!user || (user.permission & C.Permission.Admin.base) == 0) {
        notFound();
    }

    const begin = new Date();
    begin.setDate(begin.getDate() - MAX_DATE_DIF);
    begin.setHours(0);
    begin.setMinutes(0);
    begin.setSeconds(0);
    begin.setMilliseconds(0);

    const posts = await prisma.post.findMany({
        where: {
            createdAt: {
                gt: begin
            }
        },
        include: {
            uploader: true
        }
    });

    const data: number[] = _.range(MAX_DATE_DIF + 1).map(x => 0);
    const contribution: Contribution = {};

    posts.forEach(post => {
        const dd = Math.floor((post.createdAt.getTime() - begin.getTime()) / 1000 / 60 / 60 / 24);
        data[dd]++;

        if (!post.uploader) return;

        contribution[post.uploader.name] = (contribution[post.uploader.name] ?? 0) + 1;
    });

    const postCount = await prisma.post.count();
    const userCount = await prisma.user.count();
    const tagCount = await prisma.tag.count();

    const latestPost = await prisma.post.findMany({
        take: 6,
        orderBy: [
            {
                createdAt: 'desc',
            },
            {
                id: 'asc'
            }
        ]
    });

    const largestTag = await prisma.tag.findMany({
        take: 3,
        include: {
            _count: {
                select: {
                    posts: true
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

    const latestUser = await prisma.user.findMany({
        take: 3,
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
        <Box sx={{
            m: 2
        }}>
            <Paper sx={{
                m: {
                    md: 2,
                    xs: 0,
                },
                p: {
                    md: 2,
                    xs: 0
                },
                overflowX: 'auto'
            }}>
                <Typography variant='h5'>
                    New post trend for 4 weeks
                </Typography>
                <NewPostChart count={data} />
                <PostContributionChart data={Object.values(contribution)} labels={Object.keys(contribution)} />
            </Paper>

            <Grid container>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{
                        m: {
                            md: 2
                        },
                        p: {
                            md: 2
                        }
                    }}>
                        <Typography variant='h5'>
                            Posts
                        </Typography>
                        <Typography>
                            {postCount} posts in total.
                        </Typography>
                        <Typography>
                            Latest 6 posts:
                        </Typography>

                        <TableContainer sx={{ mb: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">#</TableCell>
                                        <TableCell align="center">Image</TableCell>
                                        <TableCell align="center">Text</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        latestPost.map(post => (
                                            <TableRow key={post.id}>
                                                <TableCell align="center">{_.first(post.id.split('-'))}</TableCell>
                                                <TableCell align="center">
                                                    <Image
                                                        src={post.imageURL!}
                                                        width={64}
                                                        height={64}
                                                        alt="image"
                                                        style={{
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {post.text}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <FlexEndButton
                            variant='contained'
                            startIcon={<SettingsIcon />}
                            LinkComponent={Link}
                            href="/admin/posts" >
                            MANAGE
                        </FlexEndButton>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{
                        m: {
                            md: 2
                        },
                        p: {
                            md: 2
                        }
                    }}>
                        <Typography variant='h5'>
                            Users
                        </Typography>
                        <Typography>
                            {userCount} users in total.
                        </Typography>
                        <Typography>
                            Latest 3 users:
                        </Typography>

                        <TableContainer sx={{ mb: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">#</TableCell>
                                        <TableCell align="center">Username</TableCell>
                                        <TableCell align="center">Permission</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        latestUser.map(user => (
                                            <TableRow key={user.id}>
                                                <TableCell align="center">{user.id}</TableCell>
                                                <TableCell align="center">{user.name}</TableCell>
                                                <TableCell align="center">{user.permission.toString(16)}</TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Edit user">
                                                        <IconButton LinkComponent={Link} href={"/admin/users/" + user.id.toString() + '/edit'} size="small">
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <form action={DeleteUser} style={{ display: 'inline-block' }}>
                                                        <input type="hidden" name="id" value={user.id} />
                                                        <Tooltip title="Delete user">
                                                            <IconButton size="small" type="submit">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </form>
                                                    <form action={ResetAccessKey} style={{ display: 'inline-block' }}>
                                                        <input type="hidden" name="id" value={user.id} />
                                                        <Tooltip title="Reset access key">
                                                            <IconButton size="small" type="submit">
                                                                <AutorenewIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </form>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <FlexEndButton
                            variant='contained'
                            startIcon={<SettingsIcon />}
                            LinkComponent={Link}
                            href="/admin/users" >
                            MANAGE
                        </FlexEndButton>

                    </Paper>

                    <Paper sx={{
                        m: {
                            md: 2
                        },
                        p: {
                            md: 2
                        }
                    }}>
                        <Typography variant='h5'>
                            Tags
                        </Typography>
                        <Typography>
                            {tagCount} tags in total.
                        </Typography>
                        <Typography>
                            3 tags with the most posts:
                        </Typography>
                        <TableContainer sx={{ mb: 2 }}>
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
                                        largestTag.map(tag => (
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

                        <FlexEndButton
                            variant='contained'
                            startIcon={<SettingsIcon />}
                            LinkComponent={Link}
                            href="/admin/tags" >
                            MANAGE
                        </FlexEndButton>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}

import { Post, User } from "@/lib/db";
import { authByCookies } from "@/lib/server-util";

import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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
import { Op } from "sequelize";

import { DeletePost } from "./posts/actions";
import { DeleteUser, ResetAccessKey } from "./users/actions";
import { NewPostChart } from './components';
import _ from "lodash";
import Link from "next/link";
import Image from "next/image";

const MAX_DATE_DIF = 28;

export default async function AdminPage() {
    const user = await authByCookies(cookies());

    if (!user || (user.permission & C.Permission.Admin.base) == 0) {
        notFound();
    }

    const begin = new Date();
    begin.setDate(begin.getDate() - MAX_DATE_DIF);

    const posts = await Post.findAll({
        attributes: ['createdAt'],
        where: {
            createdAt: {
                [Op.gt]: begin
            }
        }
    });

    const data: number[] = _.range(MAX_DATE_DIF).map(x => 0);

    posts.forEach(post => {
        const dd = Math.floor((post.createdAt.getTime() - begin.getTime()) / 1000 / 60 / 60 / 24);
        data[dd]++;
    });

    const postCount = await Post.count();
    const userCount = await User.count();

    const latestPost = await Post.findAll({
        limit: 3,
        order: [['createdAt', 'DESC'], ['id', 'ASC']],
    });

    const latestUser = await User.findAll({
        limit: 3,
        order: [['createdAt', 'DESC'], ['id', 'ASC']]
    });

    return (
        <Box sx={{
            m: 2
        }}>
            <Paper sx={{
                m: 2,
                p: 2,
                overflowX: 'auto'
            }}>
                <Typography variant='h6'>
                    New post trend for 4 weeks
                </Typography>
                <NewPostChart count={data} />
            </Paper>

            <Grid container>
                <Grid xs={12} md={6}>
                    <Paper sx={{ m: 2, p: 2 }}>
                        <Typography variant='h6'>
                            Posts
                        </Typography>
                        <Typography>
                            {postCount} posts in total.
                        </Typography>
                        <Typography>
                            Latest 3 posts:
                        </Typography>

                        <TableContainer sx={{ mb: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">#</TableCell>
                                        <TableCell align="center">Image</TableCell>
                                        <TableCell align="center">Text</TableCell>
                                        <TableCell align="center">Actions</TableCell>
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
                                                <TableCell align="center">{post.text}</TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="Edit">
                                                        <IconButton LinkComponent={Link} href={"/admin/posts/" + post.id + '/edit'} size="small">
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <form action={DeletePost} style={{ display: 'inline-block' }}>
                                                        <input type="hidden" name="id" value={post.id} />
                                                        <Tooltip title="Delete">
                                                            <IconButton size="small" type="submit">
                                                                <DeleteIcon />
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

                        <Grid container sx={{ justifyContent: 'flex-end' }}>
                            <Grid>
                                <Button
                                    variant='contained'
                                    startIcon={<SettingsIcon />}
                                    LinkComponent={Link}
                                    href="/admin/posts" >
                                    MANAGE
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid xs={12} md={6}>
                    <Paper sx={{ m: 2, p: 2 }}>
                        <Typography variant='h6'>
                            Users
                        </Typography>
                        {userCount} users in total.

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

                        <Grid container sx={{ justifyContent: 'flex-end' }}>
                            <Grid>
                                <Button
                                    variant='contained'
                                    startIcon={<SettingsIcon />}
                                    LinkComponent={Link}
                                    href="/admin/users" >
                                    MANAGE
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
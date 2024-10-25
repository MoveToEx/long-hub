import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AutorenewIcon from '@mui/icons-material/Autorenew';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

import CopiableText from "@/components/CopiableText";
import { Pagination } from '../components';

import { prisma } from "@/lib/db";
import Link from 'next/link';
import { DeleteUser, ResetAccessKey as ResetAccessKey } from './actions';
import React from 'react';
import { authByCookies } from '@/lib/server-util';
import { notFound } from 'next/navigation';
import * as C from '@/lib/constants';

const pageLimit = 24;

export default async function UserPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const user = await authByCookies();

    if (!user || (user.permission & C.Permission.Admin.base) == 0) {
        notFound();
    }
    
    const { page } = await searchParams;
    const offset = pageLimit * (Number(page ?? '1') - 1);
    const users = await prisma.user.findMany({
        skip: offset,
        take: pageLimit
    });
    const total = await prisma.user.count();

    return (
        <Box>
            <Box sx={{ m: 2 }}>
                <Button variant="text" LinkComponent={Link} href="/admin">
                    ≪ BACK
                </Button>
                <Typography>
                    Total users: {total}
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">#</TableCell>
                                <TableCell align="center">Username</TableCell>
                                <TableCell align="center">Password Hash</TableCell>
                                <TableCell align="center">Access Key</TableCell>
                                <TableCell align="center">Permission</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell align="center">{user.id}</TableCell>
                                        <TableCell align="center">{user.name}</TableCell>
                                        <TableCell align="center">
                                            <CopiableText text={user.passwordHash} maxLength={16} />
                                        </TableCell>
                                        <TableCell align="center"><CopiableText text={user.accessKey} maxLength={16} /></TableCell>
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
            </Box>
            <Pagination
                count={Math.ceil(total / pageLimit)}
                page={Number(page ?? '1')} />
        </Box>
    )
}
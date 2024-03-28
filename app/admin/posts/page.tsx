import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { Pagination } from '../components';

import { prisma } from "@/lib/db";
import Link from 'next/link';
import React from 'react';
import _ from 'lodash';
import Image from 'next/image';
import { DeletePost } from './actions';

const pageLimit = 24;

export default async function UserPage({
    searchParams
}: {
    searchParams?: {
        page?: string
    }
}) {
    const page = Number(searchParams?.page ?? '1');
    const offset = pageLimit * (page - 1);
    const posts = await prisma.post.findMany({
        orderBy: [
            {
                createdAt: 'desc'
            }
        ],
        skip: offset,
        take: pageLimit
    });
    const total = await prisma.post.count();

    return (
        <Box>
            <Box sx={{ m: 2 }}>
                <Button variant="text" LinkComponent={Link} href="/admin">
                    ≪ BACK
                </Button>
                <Typography>
                    Total posts: {total}
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">#</TableCell>
                                <TableCell align="center">Image</TableCell>
                                <TableCell align="center">Text</TableCell>
                                <TableCell align="center">Aggr</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                posts.map(post => (
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
                                        <TableCell align="center">{post.aggr}</TableCell>
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
            </Box>
            <Pagination
                count={Math.ceil(total / pageLimit)}
                page={page} />
        </Box>
    )
}
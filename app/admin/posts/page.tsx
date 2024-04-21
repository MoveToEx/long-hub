import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { prisma } from "@/lib/db";
import { PostGrid } from './components';
import Link from 'next/link';
import React from 'react';
import _ from 'lodash';
import { authByCookies } from '@/lib/server-util';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import * as C from '@/lib/constants';

export default async function UserPage() {

    const user = await authByCookies(cookies());

    if (!user || (user.permission & C.Permission.Admin.Post.edit) == 0) {
        return notFound();
    }


    const posts = await prisma.post.findMany({
        orderBy: [
            {
                createdAt: 'desc'
            }
        ],
        select: {
            id: true,
            image: true,
            imageURL: true,
            text: true,
            aggr: true,
            createdAt: true,
            imageHash: true,
            uploaderId: true
        }
    });
    
    return (
        <Box>
            <Box sx={{ m: 2 }}>
                <Button variant="text" LinkComponent={Link} href="/admin">
                    ≪ BACK
                </Button>
                <PostGrid posts={posts.map(post => Object.fromEntries(Object.entries(post))) as unknown as typeof posts} />
            </Box>
        </Box>
    )
}
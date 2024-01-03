import Stack from '@mui/material/Stack';
import React from 'react';
import { Post, Tag } from '@/lib/db';
import Pagination from '@/components/Pagination';
import _ from 'lodash';
import Grid from '@mui/material/Unstable_Grid2';
import Image from 'next/image';
import Link from 'next/link';
import TagRow from '@/components/TagRow';
import Typography from '@mui/material/Typography';
import { Metadata } from 'next';

const pageLimit = 64;

export const metadata: Metadata = {
    title: 'Posts list'
};

export default async function PostList({
    searchParams
}: {
    searchParams?: {
        page?: string
    }
}) {
    const page = Number(searchParams?.page ?? 1);

    const posts = await Post.findAll({
        order: [['createdAt', 'DESC']],
        limit: pageLimit,
        offset: (page - 1) * pageLimit,
        include: {
            model: Tag,
            attributes: ['name']
        }
    });
    const count = await Post.count();

    return (
        <>
            <Stack alignItems="center" sx={{m: 2}}>
                <Typography variant="h4">
                    {count} images in total
                </Typography>
            </Stack>
            <Stack spacing={1}>
                {
                    posts.map(post => (
                        <Grid container key={post.id} spacing={2}>
                            <Grid xs={4} md={2} mdOffset={2} sx={{ minHeight: '128px' }}>
                                <Link href={`/post/${post.id}`}>
                                    <Image
                                        src={post.imageURL!}
                                        alt={post.id}
                                        height={200}
                                        width={200}
                                        style={{
                                            width: '100%',
                                            height: '200px',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </Link>
                            </Grid>
                            <Grid xs={8} md={6}>
                                <Stack spacing={1} justifyItems="center">
                                    <div>
                                        {post.id}
                                    </div>
                                    <div>
                                        {post.text ?? <i>Notext</i>}
                                    </div>
                                    <div>
                                        <TagRow tags={post.tags.map(e => e.name)} />
                                    </div>
                                </Stack>
                            </Grid>
                        </Grid>
                    ))
                }
            </Stack>

            <Pagination total={Math.ceil(count / pageLimit)} />
        </>
    );
}
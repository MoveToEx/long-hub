'use client';

import Grid from '@mui/material/Grid';
import { use } from 'react';
import PostDetails from '@/components/post/PostDetails';
import DeletionRequests from '@/components/post/DeletionRequests';
import PostImage from '@/components/post/PostImage';

export default function PostPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);

    return (
        <Grid container spacing={2} sx={{ m: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
                <PostImage id={id} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
                <PostDetails id={id} />
                <DeletionRequests id={id} />
            </Grid>
        </Grid>
    )
}
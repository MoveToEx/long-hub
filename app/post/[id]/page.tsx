'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import _ from 'lodash';
import TagRow from '@/components/TagRow';
import CopiableImage from '@/components/CopiableImage';
import Skeleton from '@mui/material/Skeleton';
import Link from 'next/link';
import { usePost } from '@/app/post/context';

export default function PostPage({
    params
}: {
    params: {
        id: string
    }
}) {
    const { data, isLoading, error } = usePost(params.id);

    if (isLoading) {
        return (
            <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
                <Grid item xs={12} md={4}>
                    <Skeleton variant="rectangular" height={300} />
                </Grid>
                <Grid item xs={12} md={8} sx={{ mt: '16px' }}>
                    <Stack alignItems="right" spacing={1}>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                    </Stack>
                </Grid>
            </Grid>
        );
    }

    return (
        <>
            {
                data &&
                <>
                    <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
                        <Grid item xs={12} md={4}>
                            <CopiableImage
                                src={data.imageURL}
                                alt={params.id}
                            />
                        </Grid>
                        <Grid item xs={12} md={8} sx={{ mt: '16px' }}>
                            <Stack alignItems="right" spacing={1}>
                                <div>
                                    {data.text ? data.text : <i>No text</i>}
                                </div>
                                <div>
                                    Uploaded at {data.createdAt} {data.uploader ? ('by ' + data.uploader.name) : <i style={{ fontSize: '16px', color: 'darkgray' }}>(Disowned)</i>}
                                </div>
                                <div>
                                    <TagRow tags={data.tags.map(e => e.name!) ?? []} />
                                </div>
                                <div>
                                    <Typography component="legend">Aggressiveness</Typography>
                                    <Rating
                                        value={data.aggr}
                                        precision={0.5}
                                        max={10}
                                        size="large"
                                        readOnly
                                    />
                                </div>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Fab size="large" color="primary" sx={{
                        position: 'absolute',
                        right: '32px',
                        bottom: '32px'
                    }} LinkComponent={Link} href={`/post/${params.id}/edit`}>
                        <EditIcon />
                    </Fab>
                </>
            }
        </>
    )
}
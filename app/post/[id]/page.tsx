'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import _ from 'lodash';
import TagRow from '@/components/TagRow';
import CopiableImage from '@/components/CopiableImage';
import TagIcon from '@mui/icons-material/Tag';
import TodayIcon from '@mui/icons-material/Today';
import Skeleton from '@mui/material/Skeleton';
import PersonIcon from '@mui/icons-material/Person';
import Link from 'next/link';
import { usePost } from '@/app/post/context';

function LoadingSkeleton({ id }: { id: string }) {
    return (
        <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
            <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={300} />
            </Grid>
            <Grid item xs={12} md={8} >
                <Stack
                    spacing={1}
                    component={Paper}
                    sx={{ p: 2 }}
                >
                    <Typography variant="h5">Post #{id}</Typography>
                    <Skeleton />
                    <div style={{ display: 'flex' }}>
                        <TodayIcon sx={{ ml: 1, mr: 1 }} />
                        <Skeleton sx={{ flexGrow: 1 }} />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <PersonIcon sx={{ ml: 1, mr: 1 }} />
                        <Skeleton sx={{ flexGrow: 1 }} />
                    </div>
                    <div style={{ display: 'flex', height: '32px' }}>
                        <TagIcon sx={{ ml: 1, mr: 1, mt: 'auto', mb: 'auto' }} />
                        <Skeleton sx={{ flexGrow: 1 }} />
                    </div>
                    <div style={{ display: 'flex', height: '30px' }}>
                        <Skeleton sx={{ flexGrow: 1 }} />
                    </div>
                    <Divider />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tooltip title="Edit metadata">
                            <Fab
                                disabled
                                size="large"
                                color="primary"
                            >
                                <EditIcon />
                            </Fab>
                        </Tooltip>
                    </div>
                </Stack>
            </Grid>
        </Grid>
    );
}

function Error({ id }: { id: string }) {
    return (
        <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
            <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={300} />
            </Grid>
            <Grid item xs={12} md={8} >
                <Stack
                    spacing={1}
                    component={Paper}
                    sx={{ p: 2 }}
                >
                    <Typography variant="h5">Post #{id}</Typography>
                    <Typography variant="body1">
                        Fetch failed
                    </Typography>
                </Stack>
            </Grid>
        </Grid>
    );
}

export default function PostPage({
    params
}: {
    params: {
        id: string
    }
}) {
    const { data, isLoading, error } = usePost(params.id);

    if (isLoading) {
        return <LoadingSkeleton id={params.id} />;
    }
    
    if (error) {
        return <Error id={params.id} />;
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
                        <Grid item xs={12} md={8} >
                            <Stack
                                spacing={1}
                                component={Paper}
                                sx={{ p: 2 }}
                            >
                                <Typography variant="h5">Post #{params.id}</Typography>
                                <Typography>{data.text ? data.text : <i>No text</i>}</Typography>
                                <div style={{ display: 'flex' }}>
                                    <TodayIcon sx={{ ml: 1, mr: 1 }} />
                                    <Typography>{data.createdAt}</Typography>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <PersonIcon sx={{ ml: 1, mr: 1 }} />
                                    <Typography>{data.uploader?.name ?? <i style={{ fontSize: '16px', color: 'darkgray' }}>(Disowned)</i>}</Typography>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <TagIcon sx={{ ml: 1, mr: 1, mt: 'auto', mb: 'auto' }} />
                                    <TagRow tags={data.tags.map(e => e.name!) ?? []} noicon />
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <Rating
                                        value={data.aggr}
                                        precision={0.5}
                                        max={10}
                                        size="large"
                                        readOnly
                                    />
                                </div>
                                <Divider />
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Tooltip title="Edit metadata">
                                        <Fab
                                            size="large"
                                            color="primary"
                                            LinkComponent={Link}
                                            href={`/post/${params.id}/edit`}
                                        >
                                            <EditIcon />
                                        </Fab>
                                    </Tooltip>
                                </div>
                            </Stack>
                        </Grid>
                    </Grid>
                </>
            }
        </>
    )
}
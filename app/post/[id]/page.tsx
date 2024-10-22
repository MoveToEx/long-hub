'use client';

import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import _ from 'lodash';
import Tooltip from '@mui/material/Tooltip';
import TagRow from '@/components/TagRow';
import CopiableImage from '@/components/CopiableImage';
import Box from '@mui/material/Box';
import TagIcon from '@mui/icons-material/Tag';
import TodayIcon from '@mui/icons-material/Today';
import Skeleton from '@mui/material/Skeleton';
import PersonIcon from '@mui/icons-material/Person';
import Image from 'next/image';
import Link from 'next/link';
import { usePost } from '@/app/post/context';
import { ReverseRatingsMapping } from '@/lib/constants';
import ratingIcon from '@/public/rating.png';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import RatingComponent from '@/components/Rating';

function LoadingSkeleton({ id }: { id: string }) {
    return (
        <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
                <Skeleton variant="rectangular" height={300} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
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
                        <Image src={ratingIcon} alt="rating" width={24} height={24} style={{
                            margin: '4px 8px 4px 8px'
                        }} />
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
            <Grid size={{ xs: 12, md: 4 }}>
                <Skeleton variant="rectangular" height={300} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} >
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

    if (isLoading || !data) {
        return <LoadingSkeleton id={params.id} />;
    }

    if (error) {
        return <Error id={params.id} />;
    }

    return (
        <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
                <CopiableImage
                    src={data.imageURL}
                    alt={params.id}
                    ImageProps={{
                        loading: 'eager'
                    }}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} >
                <Stack
                    spacing={1}
                    component={Paper}
                    sx={{ p: 2 }}
                >
                    <Typography variant="h5">Post #{params.id}</Typography>
                    <Typography>{data.text ? data.text : <i>No text</i>}</Typography>
                    <div style={{ display: 'flex' }}>
                        <Tooltip title="Created at">
                            <TodayIcon sx={{ ml: 1, mr: 1 }} />
                        </Tooltip>
                        <Typography>{data.createdAt}</Typography>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Tooltip title="Uploader">
                            <PersonIcon sx={{ ml: 1, mr: 1 }} />
                        </Tooltip>
                        <Typography>
                            {data.uploader?.name ?? <i style={{ fontSize: '16px', color: 'darkgray' }}>(Disowned)</i>}
                        </Typography>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Tooltip title="Tags">
                            <TagIcon sx={{ ml: 1, mr: 1, mt: 'auto', mb: 'auto' }} />
                        </Tooltip>
                        <TagRow tags={data.tags.map(e => e.name) ?? []} noicon />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Tooltip title="Rating">
                            <Image src={ratingIcon} alt="rating" width={24} height={24} style={{
                                margin: '4px 8px 4px 8px'
                            }} />
                        </Tooltip>
                        <RatingComponent value={data.rating} readOnly />
                        <Box sx={{ ml: 1 }}>
                            {_.upperFirst(data.rating)}
                        </Box>
                    </div>
                    <Divider />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', gap: '10px' }}>
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
                        <Tooltip title="Original file">
                            <Fab
                                size="large"
                                color="primary"
                                target="_blank"
                                href={data.imageURL}
                            >
                                <ImageIcon />
                            </Fab>
                        </Tooltip>
                    </div>
                </Stack>
            </Grid>
        </Grid>
    )
}
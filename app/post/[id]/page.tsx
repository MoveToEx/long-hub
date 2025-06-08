'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import Skeleton from '@mui/material/Skeleton';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UndoIcon from '@mui/icons-material/Undo';
import InfoIcon from '@mui/icons-material/Info';
import BlockIcon from '@mui/icons-material/Block';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Link from 'next/link';
import { usePost, useUser } from '@/app/context';
import RatingIcon from '@/components/RatingIcon';
import ImageIcon from '@mui/icons-material/Image';
import RatingComponent from '@/components/Rating';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { use } from 'react';
import { RequestStatus } from '@prisma/client';

const RequestIcon = {
    'pending': <HourglassBottomIcon />,
    'cancelled': <CancelIcon />,
    'approved': <CheckCircleIcon />,
    'revoked': <UndoIcon />,
    'dismissed': <BlockIcon />
}

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
                    sx={{ p: 2 }}>
                    <Typography variant="h5">Post #{id}</Typography>
                    <Skeleton />
                    <div className="flex">
                        <TodayIcon sx={{ ml: 1, mr: 1 }} />
                        <Skeleton sx={{ flexGrow: 1 }} />
                    </div>
                    <div className="flex">
                        <PersonIcon sx={{ ml: 1, mr: 1 }} />
                        <Skeleton sx={{ flexGrow: 1 }} />
                    </div>
                    <div style={{ display: 'flex', height: '32px' }}>
                        <TagIcon sx={{ ml: 1, mr: 1, mt: 'auto', mb: 'auto' }} />
                        <Skeleton sx={{ flexGrow: 1 }} />
                    </div>
                    <div style={{ display: 'flex', height: '30px' }}>
                        <RatingIcon />
                        <Skeleton sx={{ flexGrow: 1 }} />
                    </div>
                    <Divider />
                    <div className='flex items-center justify-evenly'>
                        <Button
                            size="large"
                            color="primary"
                            disabled
                            startIcon={<EditIcon />}>
                            Edit
                        </Button>
                        <Button
                            size="large"
                            color="primary"
                            disabled
                            startIcon={<ImageIcon />}>
                            Image
                        </Button>
                        <Button
                            size="large"
                            color="error"
                            disabled
                            startIcon={<DeleteIcon />}>
                            Request deletion
                        </Button>
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
                    sx={{ p: 2 }}>
                    <Typography variant="h5">Post #{id}</Typography>
                    <Typography variant="body1">
                        Fetch failed
                    </Typography>
                </Stack>
            </Grid>
        </Grid>
    );
}

function Requests({
    requests
}: {
    requests: NonNullable<ReturnType<typeof usePost>['data']>['deletion_requests']
}) {
    return (
        <Accordion sx={{ mt: 2 }} >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">Deletion requests</Typography>
                <Typography color="textSecondary" className="flex-1 self-center text-right">
                    {requests.length}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                {requests.map(request => (
                    <Box key={request.id} className="flex items-stretch">
                        <Box className="self-center" sx={{ m: 1 }}>
                            <Tooltip title={request.status}>
                                {RequestIcon[request.status]}
                            </Tooltip>
                        </Box>
                        <Box>
                            <Typography variant="body1" fontWeight={request.status === RequestStatus.approved ? 600 : 400}>
                                Reason: {request.reason}
                            </Typography>
                            <Typography variant="subtitle2">
                                Created at {request.createdAt} by {request.user.name}
                            </Typography>
                        </Box>
                    </Box>
                ))}
                <Typography variant="subtitle2" className="text-right" color="textSecondary" sx={{ mt: 2 }}>
                    You can create, modify or cancel your request on &apos;Request deletion&apos; page.
                </Typography>
            </AccordionDetails>
        </Accordion>
    )
}

function Panel({
    post
}: {
    post: NonNullable<ReturnType<typeof usePost>['data']>
}) {
    const user = useUser();
    return (
        <Stack
            spacing={1}
            component={Paper}
            sx={{ p: 2 }}>
            <Typography variant="h5" className="flex items-center">
                {post.deletedAt !== null && <VisibilityOffIcon sx={{ mr: 1 }} />}
                Post #{post.id}
            </Typography>
            <Typography>{post.text ? post.text : <i>No text</i>}</Typography>
            <div className="flex">
                <Tooltip title="Created at">
                    <TodayIcon sx={{ ml: 1, mr: 1 }} />
                </Tooltip>
                <Typography>{post.createdAt}</Typography>
            </div>
            {post.deletedAt && (
                <div className="flex">
                    <Tooltip title="Deleted at">
                        <DeleteIcon sx={{ ml: 1, mr: 1 }} />
                    </Tooltip>
                    <Typography>Deleted at {post.deletedAt}</Typography>
                </div>
            )}
            {post.deletionReason && (
                <div className="flex">
                    <Tooltip title="Deletion reason">
                        <InfoIcon sx={{ ml: 1, mr: 1 }} />
                    </Tooltip>
                    <Typography>{post.deletionReason}</Typography>
                </div>
            )}
            <div className="flex">
                <Tooltip title="Uploader">
                    <PersonIcon sx={{ ml: 1, mr: 1 }} />
                </Tooltip>
                <Typography color={post.uploader === null ? 'textSecondary' : 'textPrimary'}>
                    {post.uploader?.name ?? <i>(Disowned)</i>}
                </Typography>
            </div>
            <div className="flex items-center" style={{ minHeight: '32px' }}>
                <Tooltip title="Tags">
                    <TagIcon sx={{ ml: 1, mr: 1 }} />
                </Tooltip>
                <TagRow tags={post.tags.map(e => e.name)} noicon />
            </div>
            <div className="flex">
                <Tooltip title="Rating">
                    <RatingIcon />
                </Tooltip>
                <RatingComponent value={post.rating} readOnly />
                <Box sx={{ ml: 1 }}>
                    {_.upperFirst(post.rating)}
                </Box>
            </div>
            <Divider />
            <div className='flex flex-wrap items-center justify-evenly'>
                <Button
                    size="large"
                    color="primary"
                    disabled={post.deletedAt !== null || user.data === undefined}
                    LinkComponent={Link}
                    startIcon={<EditIcon />}
                    href={`/post/${post.id}/edit`}>
                    Edit
                </Button>
                <Button
                    size="large"
                    color="primary"
                    target="_blank"
                    startIcon={<ImageIcon />}
                    href={post.imageURL}>
                    Image
                </Button>
                <Button
                    size="large"
                    color="error"
                    LinkComponent={Link}
                    disabled={post.deletedAt !== null || user.data === undefined}
                    startIcon={<DeleteIcon />}
                    href={`/post/${post.id}/deletion`}>
                    Request deletion
                </Button>
            </div>
        </Stack>
    )
}

export default function PostPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const { data, isLoading, error } = usePost(id);

    if (isLoading) {
        return <LoadingSkeleton id={id} />;
    }

    if (error || !data) {
        return <Error id={id} />;
    }

    return (
        <Grid container spacing={2} sx={{ m: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
                <CopiableImage
                    src={data.imageURL}
                    alt={id}
                    ImageProps={{
                        loading: 'eager'
                    }}
                />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} >
                <Panel post={data} />

                {data.deletion_requests.length > 0 && <Requests requests={data.deletion_requests} />}
            </Grid>
        </Grid>
    )
}
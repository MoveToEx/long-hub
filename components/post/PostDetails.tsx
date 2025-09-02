'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import _ from 'lodash';
import Tooltip from '@mui/material/Tooltip';
import TagRow from '@/components/TagRow';
import Box from '@mui/material/Box';
import TagIcon from '@mui/icons-material/Tag';
import TodayIcon from '@mui/icons-material/Today';
import DeleteIcon from '@mui/icons-material/Delete';
import Skeleton from '@mui/material/Skeleton';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import Link from 'next/link';
import { usePost, useSession } from '@/app/context';
import RatingIcon from '@/components/RatingIcon';
import ImageIcon from '@mui/icons-material/Image';
import RatingComponent from '@/components/Rating';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export function LoadingSkeleton({ id }: { id: string }) {
    return (
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
    );
}

export default function PostDetails({
    id
}: {
    id: string
}) {
    const user = useSession();
    const { data, isLoading, error } = usePost(id);

    if (isLoading) {
        return <LoadingSkeleton id={id} />
    }

    if (error || !data) {
        return <span>Failed to fetch</span>
    }


    return (
        <Stack
            spacing={1}
            component={Paper}
            sx={{ p: 2 }}>
            <Typography className="flex items-center">
                {data.deletedAt !== null && <VisibilityOffIcon sx={{ mr: 1 }} />}
                #{data.id}
            </Typography>
            <Typography variant='h6'>{data.text ? data.text : <i>No text</i>}</Typography>
            <div className="flex">
                <Tooltip title="Created at">
                    <TodayIcon sx={{ ml: 1, mr: 1 }} />
                </Tooltip>
                <Typography>{data.createdAt}</Typography>
            </div>
            {data.deletedAt && (
                <div className="flex">
                    <Tooltip title="Deleted at">
                        <DeleteIcon sx={{ ml: 1, mr: 1 }} />
                    </Tooltip>
                    <Typography>Deleted at {data.deletedAt}</Typography>
                </div>
            )}
            {data.deletionReason && (
                <div className="flex">
                    <Tooltip title="Deletion reason">
                        <InfoIcon sx={{ ml: 1, mr: 1 }} />
                    </Tooltip>
                    <Typography>{data.deletionReason}</Typography>
                </div>
            )}
            <div className="flex">
                <Tooltip title="Uploader">
                    <PersonIcon sx={{ ml: 1, mr: 1 }} />
                </Tooltip>
                {data.uploader !== null && (
                    <Link href={`/user/${data.uploader.id}`}>
                        <Typography color='textPrimary'>
                            {data.uploader?.name ?? <i>(Disowned)</i>}
                        </Typography>
                    </Link>
                )}
                {data.uploader === null && (
                    <Typography color='textSecondary'>
                        <i>(Disowned)</i>
                    </Typography>
                )}
            </div>
            <div className="flex items-center" style={{ minHeight: '32px' }}>
                <Tooltip title="Tags">
                    <TagIcon sx={{ ml: 1, mr: 1 }} />
                </Tooltip>
                <TagRow tags={data.tags.map(e => e.name)} noicon />
            </div>
            <div className="flex">
                <Tooltip title="Rating">
                    <RatingIcon />
                </Tooltip>
                <RatingComponent value={data.rating} readOnly />
                <Box sx={{ ml: 1 }}>
                    {_.upperFirst(data.rating)}
                </Box>
            </div>
            <Divider />
            <div className='flex flex-wrap items-center justify-evenly'>
                <Button
                    color="primary"
                    disabled={data.deletedAt !== null || user.data === undefined}
                    LinkComponent={Link}
                    startIcon={<EditIcon />}
                    href={`/post/${data.id}/edit`}>
                    Edit
                </Button>
                <Button
                    color="primary"
                    target="_blank"
                    startIcon={<ImageIcon />}
                    href={data.imageURL}>
                    Image
                </Button>
                <Button
                    color="error"
                    LinkComponent={Link}
                    disabled={data.deletedAt !== null || user.data === undefined}
                    startIcon={<DeleteIcon />}
                    href={`/post/${data.id}/deletion`}>
                    Request deletion
                </Button>
            </div>
        </Stack>
    )
}
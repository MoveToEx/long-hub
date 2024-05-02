'use client';

import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import TagIcon from '@mui/icons-material/Tag';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import CircularProgress from '@mui/material/CircularProgress';
import { useTags } from '../post/context';
import { useSnackbar } from 'notistack';

export default function Tags() {
    const tags = useTags();
    const { enqueueSnackbar } = useSnackbar();

    if (tags.error) {
        enqueueSnackbar('Failed: ' + tags.error, { variant: 'error' });
    }

    return (
        <>
            {tags.isLoading &&
                <CircularProgress autoFocus={false} sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }} />
            }
            <Box sx={{ mt: '12px' }}>
                {
                    tags.data && tags.data.map(tag => (
                        <Badge
                            badgeContent={tag.count}
                            key={tag.name}
                            color="primary"
                            sx={{
                                m: 1
                            }}>
                            <Link href={"/tag/" + tag.name} prefetch={false}>
                                <Chip label={<Typography>{tag.name}</Typography>} icon={<TagIcon />} />
                            </Link>
                        </Badge>
                    ))
                }
            </Box>
        </>
    )
}
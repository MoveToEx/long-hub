'use client';

import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import TagIcon from '@mui/icons-material/Tag';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';


interface Tag {
    id: number,
    name: string,
    count: number
};

export default function Tags() {
    const [tags, setTags] = useState<Tag[]>([]);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        fetch('/api/post/tag')
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(data => {
                setTags(data);
            })
            .catch(reason => {
                enqueueSnackbar(reason, { variant: 'error' });
            });
    }, [enqueueSnackbar]);

    return (
        <>
            {tags.length == 0 &&
                <CircularProgress autoFocus={false} sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }} />
            }
            <Box sx={{ mt: '12px' }}>
                {
                    tags.map(tag => (
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
'use client';

import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import Tooltip from '@mui/material/Tooltip';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { useUser } from '@/app/context';
import { usePost } from '@/app/context';
import { Rating } from '@prisma/client';
import RatingComponent from '@/components/Rating';
import RatingIcon from '@/components/RatingIcon';
import { TagsInput } from '@/components/TagsInput';

export default function Post({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const [submitting, setSubmitting] = useState(false);
    const initialized = useRef(false);
    const [meta, setMeta] = useState({
        text: '',
        rating: Rating.none as Rating,
        tags: [] as string[],
    });
    const post = usePost(id);

    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const { data: user, isLoading } = useUser();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/account/login');
        }
    }, [user, router, isLoading]);

    useEffect(() => {
        if (post.data && !initialized.current) {
            initialized.current = true;
            setMeta({
                text: post.data.text,
                tags: post.data.tags.map(x => x.name),
                rating: post.data.rating
            });
        }
    }, [post]);

    function submit() {
        setSubmitting(true);
        fetch('/api/post/' + id, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meta)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                router.push('/post/' + id);
            })
            .catch(reason => {
                enqueueSnackbar(reason, { variant: 'error' });
            })
            .finally(() => {
                setSubmitting(false);
            });
    }

    return (
        <Grid container spacing={2} sx={{ m: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
                {post.data &&
                    <Image
                        className="w-full h-auto max-h-80 object-contain"
                        crossOrigin='anonymous'
                        alt="Preview"
                        unoptimized
                        src={post.data.imageURL}
                        height={320}
                        width={320} />}
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} sx={{ mt: 2 }}>
                <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                        label="Text"
                        name="text"
                        fullWidth
                        value={meta.text}
                        onChange={e => {
                            setMeta({
                                ...meta,
                                text: e.target.value
                            });
                        }}
                    />
                    <TagsInput
                        value={meta.tags}
                        onChange={v => setMeta({
                            ...meta,
                            tags: v
                        })} />
                    <Box alignItems="center" sx={{ width: '100%', display: 'flex' }}>
                        <Tooltip title="Rating">
                            <RatingIcon />
                        </Tooltip>
                        <RatingComponent
                            value={meta.rating}
                            onChange={(_, newValue) => {
                                setMeta({
                                    ...meta,
                                    rating: newValue
                                });
                            }} />
                        <Box sx={{ ml: 1 }}>
                            {_.upperFirst(meta.rating)}
                        </Box>
                    </Box>

                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Fab onClick={submit} color="primary" disabled={submitting || post.isLoading}>
                            <SendIcon />
                        </Fab>
                        {
                            submitting || post.isLoading && (
                                <CircularProgress
                                    size={68}
                                    sx={{
                                        position: 'absolute',
                                        top: -6,
                                        left: -6,
                                        zIndex: 1
                                    }}
                                />
                            )
                        }
                    </Box>
                </Stack>
            </Grid>
        </Grid>
    )
}
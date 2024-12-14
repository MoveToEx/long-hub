'use client';

import Grid from '@mui/material/Grid2';
import Image from 'next/image';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { useUser } from '@/app/context';
import { usePost, useTags } from '@/app/context';
import { Rating } from '@prisma/client';
import RatingComponent from '@/components/Rating';
import RatingIcon from '@/components/RatingIcon';

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
    const tags = useTags();
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
            method: 'PUT',
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
        <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
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
                    <Autocomplete
                        multiple
                        freeSolo
                        value={meta.tags}
                        fullWidth
                        options={tags.data?.map(val => val.name) ?? []}
                        onChange={(__, newValue) => {
                            if (newValue.length == 0 || /^[a-z0-9_]+$/.test(_.last(newValue) ?? '')) {
                                setMeta({
                                    ...meta,
                                    tags: newValue
                                });
                            }
                            else {
                                enqueueSnackbar('Illegal tag name', { variant: 'error' });
                            }
                        }}
                        renderOption={(props, option) => {
                            return (
                                <li {...props} key={option}>
                                    {option}
                                </li>
                            );
                        }}
                        renderTags={(value: readonly string[], getTagProps) =>
                            value.map((option: string, index: number) => (
                                <Chip {...getTagProps({ index })} variant="outlined" label={option} key={index} />
                            ))
                        }
                        renderInput={
                            (params) => (
                                <TextField
                                    {...params}
                                    label="Tags"
                                    type="text"
                                    error={!/^[a-z0-9_]*$/.test(params.inputProps.value as string ?? '')}
                                    helperText={"Only lower case, digits and underline are allowed in tags"}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: tags.isLoading ? <CircularProgress size={20} /> : <></>
                                    }}
                                    variant="outlined" />
                            )
                        }
                    />
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
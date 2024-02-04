'use client';

import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import _ from 'lodash';
import PostMetadata from '@/lib/types/PostMetadata';
import { useSnackbar } from 'notistack';
import { useUser } from '@/app/context';

export default function Post({
    params
}: {
    params: {
        id: String
    }
}) {
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<PostMetadata>({
        text: '',
        aggr: 0,
        tags: [],
    });
    const [image, setImage] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();
    const user = useUser();

    useEffect(() => {
        if (user === null) {
            router.push('/account/login');
        }
    }, [user, router]);

    useEffect(() => {
        if (!user) return;

        fetch('/api/post/' + params.id)
            .then(response => response.json())
            .then((x: any) => {
                setMeta({
                    text: x.text,
                    tags: x.tags.map((x: any) => x.name),
                    aggr: x.aggr
                });
                setImage(x.imageURL);
            })
            .finally(() => setLoading(false));
        fetch('/api/post/tag')
            .then(response => response.json())
            .then(x => setTags(x.map((x: any) => x.name)));
    }, [params.id, user]);

    function submit() {
        setLoading(true);
        axios.put(`/api/post/${params.id}/`, meta)
            .then(() => router.back());
    }


    return (
        <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
            <Grid item xs={12} md={4}>
                {image ?
                    <Image
                        id="preview-image"
                        alt="Preview"
                        src={image}
                        height={0}
                        width={500}
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain'
                        }} />
                    : <></>}
            </Grid>
            <Grid item xs={12} md={8}>
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
                        options={tags}
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
                                    variant="outlined" />
                            )
                        }
                    />
                    <Box alignItems="center">
                        <Typography component="legend">Aggressiveness</Typography>
                        <Rating
                            value={meta.aggr}
                            precision={0.5}
                            max={10}
                            size="large"
                            onChange={(event, newValue) => {
                                setMeta({
                                    ...meta,
                                    aggr: newValue ?? 0
                                });
                            }}
                        />
                    </Box>

                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Fab onClick={submit} color="primary" disabled={loading}>
                            <SendIcon />
                        </Fab>
                        {
                            loading && (
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
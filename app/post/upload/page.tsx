'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import Rating from '@mui/material/Rating';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Chip from '@mui/material/Chip';
import styles from './page.module.css';
import { useContext, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import PostMetadata from '@/lib/types/PostMetadata';
import LinkImageGrid from '@/components/LinkImageGrid';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';
import _ from 'lodash';
import Link from '@mui/material/Link';
import axios from 'axios';
import DropArea from '@/components/DropArea';

import { useUser } from '@/app/context';
import { useRouter } from 'next/navigation';

interface Preview {
    file: File,
    url: string
};

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<Preview[]>([]);
    const [meta, setMeta] = useState<PostMetadata>({
        text: '',
        aggr: 0,
        tags: []
    });
    const [tags, setTags] = useState<string[]>([]);
    const [ignoreSimilar, setIgnoreSimilar] = useState(false);
    const [similar, setSimilar] = useState<string[]>([]);

    const { user } = useUser();
    const router = useRouter();

    const { enqueueSnackbar } = useSnackbar();

    let elem;

    useEffect(() => {
        if (user === null) {
            router.push('/account/login');
        }
    }, [user, router]);

    useEffect(() => {
        fetch('/api/post/tag')
            .then(val => val.json())
            .then(x => setTags(x.map((x: any) => x.name)));
    }, []);

    function next() {
        setMeta({
            text: '',
            aggr: 0,
            tags: []
        });
        setIgnoreSimilar(false);
        setFiles(_.slice(files, 1));
    }

    function submit() {
        setLoading(true);
        var fd = new FormData();
        fd.append('force', ignoreSimilar ? '1' : '0');
        fd.append('image', files[0].file);
        fd.append('metadata', JSON.stringify(meta));

        fetch('/api/post', {
            method: 'POST',
            body: fd,
        })
            .then(response => {
                if (response.ok) {
                    next();
                    enqueueSnackbar('Uploaded successfully', {
                        variant: 'success'
                    });
                }
                else if (response.status == 409) {
                    response.json().then(data => setSimilar(data));
                }
                else {
                    enqueueSnackbar('Failed: ' + response.statusText, {
                        variant: 'error'
                    });
                }
            })
            .finally(() => setLoading(false));
    }

    function skip() {
        next();
        enqueueSnackbar('Skipped 1 image', {
            variant: 'info'
        });
    }

    if (files.length == 0) {
        elem = (
            <DropArea
                accept="image/*"
                multiple
                label={
                    <Typography variant="button" fontSize="24px" display="block" gutterBottom>
                        SELECT FILE
                    </Typography>
                }
                className={styles.droparea}
                dragClassName={styles.droparea_hover}
                onChange={files => {
                    setFiles(files.map(file => ({
                        file: file,
                        url: URL.createObjectURL(file)
                    })));
                }}
            />
        )
    }
    else {
        elem = (
            <Grid container spacing={2} sx={{ paddingTop: '16px' }}>
                <Grid item xs={12} md={4}>
                    <Image
                        id="preview-image"
                        alt="Preview"
                        src={files[0].url}
                        height={500}
                        width={0}
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain'
                        }} />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Stack spacing={2} alignItems="center" sx={{ m: 2 }}>
                        <Typography variant="h6">
                            {files.length.toString() + ' image' + (files.length > 1 ? 's' : '') + ' left'}
                        </Typography>
                        <TextField
                            label="Text"
                            fullWidth
                            value={meta.text}
                            type="text"
                            autoComplete="off"
                            name="text"
                            autoFocus
                            onChange={(e) => {
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
                            options={
                                tags || []
                            }
                            onChange={(__, newValue) => {
                                if (newValue.length == 0 || /^[a-z0-9_]+$/.test(_.last(newValue) ?? '')) {
                                    setMeta({
                                        ...meta,
                                        tags: newValue
                                    });
                                }
                            }}
                            renderOption={(props, option) => {
                                return <li {...props} key={option}>{option}</li>;
                            }}
                            renderTags={(value, getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <Chip {...getTagProps({ index })} variant="outlined" label={option} key={index} />
                                ))
                            }
                            renderInput={
                                (params) => (
                                    <TextField
                                        {...params}
                                        label="Tags"
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
                                onChange={(_event, newValue) => {
                                    setMeta({
                                        ...meta,
                                        aggr: newValue ?? 0
                                    });
                                }}
                            />
                        </Box>

                        <FormControlLabel control={<Checkbox checked={ignoreSimilar} onChange={(e, c) => setIgnoreSimilar(c)} />} label="Ignore similar" />

                        <Box sx={{ p: 1, position: 'relative' }} >

                            <Stack direction="row" spacing={2}>
                                <Box sx={{ position: 'relative' }}>
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

                                <Fab onClick={skip} color="error">
                                    <DeleteIcon />
                                </Fab>
                            </Stack>
                        </Box>

                        <Typography variant="subtitle2">
                            Make sure to read <Link href="/doc/guide/uploading" target="_blank">upload docs</Link> first.
                        </Typography>
                    </Stack>
                </Grid>
            </Grid>
        )
    }

    return (
        <>
            <Dialog onClose={() => setSimilar([])} open={similar.length != 0} maxWidth="md" fullWidth>
                <DialogTitle>Similar images</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {"The following posts have a similar image to yours. To upload anyway, check the ignore checkbox and submit again."}
                    </DialogContentText>
                    <Box>
                        <LinkImageGrid
                            src={similar.map((post: any) => ({
                                href: `/post/${post.id}`,
                                src: post.imageURL
                            }))}
                            gridProps={{
                                md: 6,
                                xs: 12
                            }}
                            gridContainerProps={{
                                spacing: 2
                            }}
                            linkProps={{
                                target: '_blank'
                            }} />
                    </Box>
                </DialogContent>
            </Dialog >

            {elem}
        </>
    )

}
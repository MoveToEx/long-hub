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
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import Tooltip from '@mui/material/Tooltip';
import PostMetadata from '@/lib/types/PostMetadata';
import LinkImageGrid from '@/components/LinkImageGrid';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FastForwardIcon from '@mui/icons-material/FastForward';
import async from 'async';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';
import _ from 'lodash';
import Link from '@mui/material/Link';
import axios from 'axios';
import DropArea from '@/components/DropArea';

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [meta, setMeta] = useState<PostMetadata>({
        text: '',
        aggr: 0,
        tags: []
    });
    const [tagsLib, setTagsLib] = useState<string[]>([]);
    const [ignoreSimilar, setIgnoreSimilar] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [similar, setSimilar] = useState<string[]>([]);

    const { enqueueSnackbar } = useSnackbar();

    let elem;

    useEffect(() => {
        axios.get('/api/post/tag')
            .then(x => setTagsLib(x.data.map((x: any) => x.name)));
    }, []);

    function submit() {
        setLoading(true);
        var fd = new FormData();
        fd.append('image', files[0].file);
        axios
            .post('/api/post/similar', fd)
            .then(res => {
                if (res.data.length && !ignoreSimilar) {
                    setSimilar(res.data);
                    setDialogOpen(true);
                    throw 'rejected for similar posts';
                }
            })
            .then(() => axios.post('/api/post', fd))
            .then(res => axios.put('/api/post/' + res.data.id, meta))
            .then(() => {
                setMeta({
                    text: '',
                    aggr: 0,
                    tags: []
                });
                setIgnoreSimilar(false);
                setFiles(_.slice(files, 1));
                enqueueSnackbar('Uploaded successfully', { variant: 'success' });
            })
            .catch(e => enqueueSnackbar('Failed when uploading: ' + e, { variant: 'error' }))
            .finally(() => setLoading(false));
    }

    function all() {
        setLoading(true);

        async.waterfall(files.map(file => (
            async () => {
                var fd = new FormData();
                fd.append('image', file.file);

                const res = await axios.post('/api/post/similar', fd);
                if (res.data.length) {
                    enqueueSnackbar('rejected for similar posts', { variant: 'error' });
                }
                else {
                    const post = await axios.post('/api/post', fd);

                    await axios.put('/api/post/' + post.data.id, {
                        text: '',
                        tags: ['tagme'],
                        aggr: 0
                    });
                }
            }
        ))).then(() => {
            enqueueSnackbar('Batch upload complete', { variant: 'info' });
            setFiles([]);
            setLoading(false);
        });
    }

    function skip() {
        setFiles([...files.slice(1)]);
        setMeta({
            text: '',
            aggr: 0,
            tags: []
        });
        setIgnoreSimilar(false);
        enqueueSnackbar('Skipped 1 image', { variant: 'info' });
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
                    if (!files) return;
                    var a = [];
                    for (var file of files) {
                        a.push({
                            file: file,
                            url: URL.createObjectURL(file)
                        });
                    }
                    setFiles(a);
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
                            {files.length.toString() + ' left'}
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
                                tagsLib || []
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
                                onChange={(event, newValue) => {
                                    setMeta({
                                        ...meta,
                                        aggr: newValue ?? 0
                                    });
                                }}
                            />
                        </Box>

                        <Box sx={{ p: 1, position: 'relative', width: '100%' }} >
                            <Stack sx={{ m: 2 }} direction="row" alignItems="center" justifyContent="center">
                                <FormControlLabel control={<Checkbox checked={ignoreSimilar} onChange={(e, c) => setIgnoreSimilar(c)} />} label="Ignore similar" />
                            </Stack>
                            <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
                                <Box sx={{ position: 'relative' }}>
                                    <Tooltip title="Submit">
                                        <Fab onClick={submit} color="primary" disabled={loading}>
                                            <SendIcon />
                                        </Fab>
                                    </Tooltip>
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
                                <Tooltip title="Skip current image">
                                    <Fab onClick={skip} disabled={loading} color="error">
                                        <DeleteIcon />
                                    </Fab>
                                </Tooltip>

                                <Tooltip title="Upload and set all images to be blank">
                                    <Fab onClick={all} disabled={loading} color="secondary">
                                        <FastForwardIcon />
                                    </Fab>
                                </Tooltip>
                            </Stack>
                        </Box>

                        <Typography variant="subtitle2">
                            Make sure to read <Link href="/doc/uploading" target="_blank">upload docs</Link> first.
                        </Typography>
                    </Stack>
                </Grid>
            </Grid>
        )
    }

    return (
        <>
            <Dialog onClose={() => setDialogOpen(!dialogOpen)} open={dialogOpen} maxWidth="md" fullWidth>
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
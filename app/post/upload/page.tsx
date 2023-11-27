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
import PostMetadata from '@/lib/PostMetadata';
import LinkImageGrid from '@/components/LinkImageGrid';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';
import _ from 'lodash';
import Link from '@mui/material/Link';
import axios from 'axios';

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
        axios.get(process.env.NEXT_PUBLIC_BACKEND_HOST + '/tag')
            .then(x => setTagsLib(x.data.map((x: any) => x.name)));
    }, []);

    function submit() {
        setLoading(true);
        var fd = new FormData();
        fd.append('image', files[0].file);
        axios
            .post(process.env.NEXT_PUBLIC_BACKEND_HOST + '/similar', fd)
            .then(res => {
                if (res.data.length && !ignoreSimilar) {
                    setSimilar(res.data);
                    setDialogOpen(true);
                    throw 'rejected for similar posts';
                }
            })
            .then(() => axios.post(process.env.NEXT_PUBLIC_BACKEND_HOST + '/post', fd))
            .then(res => axios.put(process.env.NEXT_PUBLIC_BACKEND_HOST + '/post/' + res.data.id, meta))
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

    function skip() {
        setFiles([...files.slice(1)]);
        enqueueSnackbar('Skipped 1 image', { variant: 'info' });
    }

    if (files.length == 0) {
        elem = (
            <Stack alignItems="center">
                <input
                    accept="image/*"
                    id="file-input"
                    multiple
                    type="file"
                    hidden
                    onChange={(e) => {
                        if (e.target.files?.length) {
                            setFiles(
                                [...e.target.files].map(x => ({
                                    file: x,
                                    url: URL.createObjectURL(x)
                                }))
                            )
                        }
                    }}
                />
                <Box
                    className={styles.droparea}
                    alignItems="center"
                    justifyContent="center"
                    id="drop-area"
                    onClick={() => {
                        document.getElementById('file-input')?.focus();
                        document.getElementById('file-input')?.click();
                    }}
                    onDrop={(e) => {
                        document.getElementById('drop-area')?.classList.remove(styles.droparea_hover);
                        e.preventDefault();
                        var a: any[] = [];
                        [...e.dataTransfer.items].forEach(item => {
                            if (item.kind !== 'file') {
                                return;
                            }
                            var f = item.getAsFile();
                            if (!f?.type.startsWith('image')) {
                                return;
                            }
                            a.push({
                                file: f,
                                url: URL.createObjectURL(f)
                            });
                        });
                        setFiles(a);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                    }}
                    onDragEnter={(e) => {
                        e.preventDefault();
                        document.getElementById('drop-area')?.classList.add(styles.droparea_hover);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        document.getElementById('drop-area')?.classList.remove(styles.droparea_hover);
                    }} >
                    <Typography variant="button" fontSize="24px" display="block" gutterBottom>
                        SELECT FILE
                    </Typography>

                </Box>
            </Stack >
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


                        <Box sx={{ p: 2, position: 'relative' }} >

                            <Stack direction="row" spacing={1}>
                                <FormControlLabel control={<Checkbox checked={ignoreSimilar} onChange={(e, c) => setIgnoreSimilar(c)} />} label="Ignore similar" />
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
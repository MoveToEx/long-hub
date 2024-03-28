'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import styles from './page.module.css';
import { useState, useRef } from 'react';
import { useSnackbar } from 'notistack';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';
import _ from 'lodash';
import Link from '@mui/material/Link';
import axios from 'axios';
import DropArea from '@/components/DropArea';
import { Rnd } from 'react-rnd';

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const image = useRef<HTMLImageElement>(null);
    const [meta, setMeta] = useState({
        name: '',
        x: 0,
        y: 0,
        height: 0,
        width: 0
    });

    const { enqueueSnackbar } = useSnackbar();

    let elem;

    function transform(x: number) {
        if (image.current === null) return 0;
        const ratio = image.current.height / image.current.naturalHeight;
        return Math.round(x / ratio);
    }

    function submit() {
        setLoading(true);
        var fd = new FormData();
        fd.append('image', files[0].file);
        axios
            .post('/api/template/' + meta.name, fd)
            .then(res => axios.put('/api/template/' + meta.name, meta))
            .then(() => {
                setMeta({
                    name: '',
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                });
                setFiles(_.slice(files, 1));
                enqueueSnackbar('Uploaded successfully', { variant: 'success' });
            })
            .catch(e => enqueueSnackbar('Failed when uploading: ' + e, { variant: 'error' }))
            .finally(() => setLoading(false));
    }

    function skip() {
        setFiles([...files.slice(1)]);
        // setMeta({
        //     name: '',
        //     rectTop: 0,
        //     rectBottom: 0,
        //     rectLeft: 0,
        //     rectRight: 0,
        // });
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
                        ref={image}
                        alt="Preview"
                        className="preview-image"
                        src={files[0].url}
                        height={300}
                        width={300}
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain'
                        }} />
                    <Rnd
                        default={{
                            x: 0,
                            y: 0,
                            width: 100,
                            height: 100
                        }}
                        bounds=".preview-image"
                        onDrag={(e, data) => {
                            const img = image.current?.getBoundingClientRect()!;
                            const box = data.node.getBoundingClientRect();
                            setMeta({
                                ...meta,
                                x: transform(box.x - img.left),
                                y: transform(box.y - img.top)
                            });
                        }}
                        onResize={(e, dir, ref) => {
                            const img = image.current?.getBoundingClientRect()!;
                            const box = ref.getBoundingClientRect();
                            setMeta({
                                ...meta,
                                x: transform(box.x - img.left),
                                y: transform(box.y - img.top),
                                height: transform(box.height),
                                width: transform(box.width)
                            });
                        }}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            border: '3px grey dashed'
                        }} />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Stack spacing={2} alignItems="center" sx={{ m: 2 }}>
                        <Typography variant="h6">
                            {files.length.toString() + ' left'}
                        </Typography>
                        <TextField
                            label="Name"
                            fullWidth
                            value={meta.name}
                            type="text"
                            autoComplete="off"
                            autoFocus
                            onChange={(e) => {
                                setMeta({
                                    ...meta,
                                    name: e.target.value
                                });
                            }}
                        />

                        <Typography>
                            Rect: {meta.width} * {meta.height} at ({meta.x}, {meta.y})
                        </Typography>

                        <Box sx={{ p: 2, position: 'relative' }} >
                            <Stack direction="row" spacing={1}>
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
            {elem}
        </>
    )

}
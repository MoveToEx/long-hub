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
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import styles from './page.module.css';
import { useEffect, useState, forwardRef } from 'react';
import Image from 'next/image';
import _ from 'lodash';
import axios from 'axios';

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [aggr, setAggr] = useState(0);
    const [inputTags, setInputTags] = useState<string[]>([]);
    const [tagsLib, setTagsLib] = useState<string[]>([]);
    const [snackbar, setSnackbar] = useState<any>({ open: false });
    let elem;

    useEffect(() => {
        axios.get('/api/tag')
            .then(x => setTagsLib(x.data.map((x: any) => x.name)));
    }, []);

    function submit() {
        setButtonDisabled(true);
        setLoading(true);
        var fd = new FormData();
        var meta = {
            text: text,
            tags: inputTags,
            aggr: aggr
        };
        fd.append('image', files[0].file);
        axios
            .post('/api/post', fd)
            .then(res => {
                return axios.put('/api/post/' + res.data.id, meta);
            }).then(res => {
                setText('');
                setAggr(0);
                setInputTags([]);
                setFiles(_.slice(files, 1));
                setSnackbar({
                    open: true,
                    severity: 'success',
                    content: 'Uploaded successfully'
                });
            }).catch(e => {
                setSnackbar({
                    open: true,
                    severity: 'error',
                    content: 'Failed when uploading'
                });
            }).finally(() => {
                setButtonDisabled(false);
                setLoading(false);
            });
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
                        height={0}
                        width={0}
                        sizes="100vw"
                        style={{
                            width: '100%',
                            height: 'auto'
                        }} />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Stack spacing={2} alignItems="center">
                        <Typography variant="h6">
                            {files.length.toString() + ' left'}
                        </Typography>
                        <TextField
                            label="Text"
                            fullWidth
                            value={text}
                            type="text"
                            autoComplete="off"
                            name="text"
                            autoFocus
                            onChange={(e) => {
                                setText(e.target.value);
                            }}
                        />
                        <Autocomplete
                            multiple
                            freeSolo
                            value={inputTags}
                            fullWidth
                            options={
                                tagsLib || []
                            }
                            onChange={(__, newValue) => {
                                setInputTags(newValue);
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
                                        variant="outlined" />
                                )
                            }
                        />
                        <Box alignItems="center">
                            <Typography component="legend">Aggressiveness</Typography>
                            <Rating
                                value={aggr}
                                precision={0.5}
                                max={10}
                                size="large"
                                onChange={(event, newValue) => {
                                    setAggr(newValue ?? 0);
                                }}
                            />
                        </Box>

                        <Box sx={{ m: 1, position: 'relative' }}>
                            <Fab onClick={submit} color="primary" disabled={buttonDisabled}>
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

    return (
        <>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => { setSnackbar({ ...snackbar, open: false }); }}>
                <Alert severity={snackbar.severity}>
                    {snackbar.content ?? ''}
                </Alert>
            </Snackbar>
            {elem}
        </>
    )

}
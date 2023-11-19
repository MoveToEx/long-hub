'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Link from 'next/link';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import _ from 'lodash';
import axios from 'axios';

export default function UploadPage() {
    const [file, setFile] = useState<any>(null);
    const [similar, setSimilar] = useState<any>(null);
    const [snackbar, setSnackbar] = useState<any>({ open: false });

    let elem;

    useEffect(() => {
        if (file === null) return;
        var fd = new FormData();
        fd.append('image', file.file);
        axios
            .post(process.env.NEXT_PUBLIC_BACKEND_HOST + '/similar', fd)
            .then(res => setSimilar(res.data))
            .catch(e => {
                setSnackbar({
                    open: true,
                    severity: 'error',
                    content: 'Failed when uploading: ' + e
                });
            });
    }, [file]);

    if (file === null) {
        elem = (
            <Stack alignItems="center">
                <input
                    accept="image/*"
                    id="file-input"
                    type="file"
                    hidden
                    onChange={(e) => {
                        if (e.target.files?.length) {
                            var f = e.target.files[0];
                            setFile({
                                file: f,
                                url: URL.createObjectURL(f)
                            })
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
                        var a = [...e.dataTransfer.items];
                        if (a[0].kind !== 'file') {
                            return;
                        }

                        var f = a[0].getAsFile();
                        if (!f?.type.startsWith('image')) {
                            return;
                        }

                        setFile({
                            file: f,
                            url: URL.createObjectURL(f)
                        });
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
            </Stack>
        )
    }
    else {
        if (similar === null) {
            elem = (
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={similar === null}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            )
        }
        else if (similar?.length === 0) {
            elem = (
                <Typography variant="h5">No similar images found</Typography>
            )
        }
        else {
            elem = (
                <>
                    <Typography variant="h5">{similar.length} similar images found</Typography>
                    <Grid container>
                        {
                            similar.map((post: any) => (
                                <Grid item key={post.id} md={6} xs={12}>
                                    <Link href={'/post/' + post.id} key={post.image} target="_blank">
                                        <Image
                                            src={post.image}
                                            alt={post.id}
                                            height={0}
                                            width={0}
                                            sizes='100vw'
                                            style={{
                                                width: '100%',
                                                height: '300px',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Link>
                                </Grid>
                            ))
                        }
                    </Grid>
                </>
            );
        }

        elem = (
            <Grid container sx={{mt: 4}}>
                <Grid item md={4} xs={12}>
                    <Image
                        src={file.url}
                        alt='preview'
                        height={0}
                        width={0}
                        sizes='100vw'
                        style={{
                            width: '100%',
                            height: '300px',
                            objectFit: 'contain'
                        }}
                    />
                </Grid>

                <Grid item md={8} xs={12}>
                    {elem}
                </Grid>
            </Grid>
        );
    }

    return (
        <>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => { setSnackbar({ ...snackbar, open: false }); }}>
                <Alert severity={snackbar.severity} variant='filled' elevation={6}>
                    {snackbar.content ?? ''}
                </Alert>
            </Snackbar>

            {elem}
        </>
    )

}
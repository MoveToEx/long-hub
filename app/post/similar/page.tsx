'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './page.module.css';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import _ from 'lodash';
import axios from 'axios';
import LinkImageGrid from '@/components/LinkImageGrid';
import DropArea from '@/components/DropArea';
import { useSnackbar } from 'notistack';

export default function UploadPage() {
    const [file, setFile] = useState<any>(null);
    const [similar, setSimilar] = useState<any>(null);

    const { enqueueSnackbar } = useSnackbar();

    let elem;

    useEffect(() => {
        if (file === null) return;
        var fd = new FormData();
        fd.append('image', file.file);
        axios
            .post('/api/similar', fd)
            .then(res => setSimilar(res.data))
            .catch(e => enqueueSnackbar('Failed when uploading: ' + e, { variant: 'error' }) );
    }, [file, enqueueSnackbar]);

    if (file === null) {
        elem = (
            <DropArea
                accept="image/*"
                label={
                    <Typography variant="button" fontSize="24px" display="block" gutterBottom>
                        SELECT FILE
                    </Typography>
                }
                className={styles.droparea}
                dragClassName={styles.droparea_hover}
                onChange={file => {
                    if (!file) return;
                    setFile(file);
                }}
            />
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
        else if (similar.length === 0) {
            elem = (
                <Typography variant="h5">No similar images found</Typography>
            )
        }
        else {
            elem = (
                <>
                    <Typography variant="h5">{similar.length} similar images found</Typography>
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
                </>
            );
        }

        elem = (
            <Grid container sx={{ mt: 4 }}>
                <Grid item md={4} xs={12}>
                    <Image
                        src={file.url}
                        alt='preview'
                        height={500}
                        width={0}
                        style={{
                            width: '100%',
                            height: 'auto',
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

    return elem;
}
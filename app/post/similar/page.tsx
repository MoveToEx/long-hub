'use client';

import styles from './page.module.css';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DropArea from '@/components/DropArea';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import Image from 'next/image';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import PostGrid from '@/components/PostGrid';

interface Preview {
    file: File;
    url: string;
}

interface SimilarPost {
    id: string;
    imageURL: string;
    diff: number;
}

interface SimilarResponse {
    hash: string;
    similar: SimilarPost[];
}


export default function UploadPage() {
    const [file, setFile] = useState<Preview | null>(null);
    const [result, setResult] = useState<SimilarResponse | null>(null);

    const { enqueueSnackbar } = useSnackbar();

    let elem;

    useEffect(() => {
        if (file === null) return;

        var fd = new FormData();
        fd.append('image', file.file);

        fetch('/api/post/similar', {
            method: 'POST',
            body: fd
        }).then(response => {
            if (!response.ok) {
                throw new Error(response.status + ' ' + response.statusText);
            }
            return response.json();
        })
            .then(res => setResult(res))
            .catch(e => enqueueSnackbar('Failed when uploading: ' + e, { variant: 'error' }));
    }, [file, enqueueSnackbar]);

    if (file === null) {
        elem = (
            <Box sx={{ m: 2 }}>
                <Typography variant='h4'>Search by image</Typography>
                <DropArea
                    accept="image/*"
                    multiple={false}
                    label={
                        <Typography variant="button" fontSize="24px" display="block" gutterBottom>
                            SELECT FILE
                        </Typography>
                    }
                    className={styles.droparea}
                    dragClassName={styles.droparea_hover}
                    onChange={file => {
                        if (!file) return;

                        setFile({
                            file: file,
                            url: URL.createObjectURL(file)
                        });
                    }}
                />
            </Box>
        )
    }
    else {
        if (result === null) {
            elem = (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5"><Skeleton width="50%" /></Typography>
                        <Typography variant="subtitle2"><Skeleton /></Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton height={300} variant='rounded' />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton height={300} variant='rounded' />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton height={300} variant='rounded' />
                    </Grid>
                </Grid>
            )
        }
        else if (result.similar.length === 0) {
            elem = (
                <>
                    <Typography variant="h5">No similar images found</Typography>
                    <Typography variant="subtitle2">
                        Image hash: {result.hash}
                    </Typography>
                </>
            )
        }
        else {
            elem = (
                <>
                    <Typography variant="h5">
                        {result.similar.length} similar images found
                    </Typography>
                    <Typography variant="subtitle2">
                        Image hash: {result.hash}
                    </Typography>
                    <Grid container spacing={1}>
                        {
                            result && result.similar.map(val => (
                                <Grid xs={12} md={4} key={val.id}>
                                    <PostGrid value={val} newTab />
                                </Grid>
                            ))
                        }
                    </Grid>
                </>
            );
        }

        elem = (
            <Grid container spacing={2} sx={{ m: 2 }}>
                <Grid xs={12}>
                    <Button variant="text" onClick={() => {
                        setFile(null);
                        setResult(null);
                    }}>
                        ≪ BACK
                    </Button>
                </Grid>
                <Grid item md={4} xs={12}>
                    <Image
                        src={file.url}
                        alt='preview'
                        height={300}
                        width={300}
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
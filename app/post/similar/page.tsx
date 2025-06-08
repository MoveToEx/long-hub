'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DragDrop from '@/components/DragDrop';
import Skeleton from '@mui/material/Skeleton';
import Button from '@mui/material/Button';
import Image from 'next/image';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import PostGrid from '@/components/PostGridItem';

interface Preview {
    file: Blob;
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

    const search = useCallback(async (file: Blob) => {
        const response = await fetch('/api/post/similar', {
            method: 'POST',
            headers: {
                'Content-Type': file.type
            },
            body: file,
        });

        if (!response.ok) {
            enqueueSnackbar(response.status + ' ' + response.statusText);
            return;
        }
        setResult(await response.json())

    }, [enqueueSnackbar]);

    useEffect(() => {
        if (file === null) return;

        search(file.file);
    }, [file, search]);

    return (
        <Grid container spacing={2} sx={{ m: 2 }}>
            <Grid size={{ md: 6, xs: 12 }}>
                <Box>
                    <Typography variant='h4'>Search by image</Typography>
                    {file === null && (
                        <DragDrop
                            accept="image/*"
                            multiple={false}
                            onChange={file => {
                                if (!file) return;

                                setFile({
                                    file: file[0],
                                    url: URL.createObjectURL(file[0])
                                });
                            }}
                        />
                    )}
                    {file !== null && (
                        <div>
                            <Button
                                variant="text"
                                disabled={result === null}
                                onClick={() => {
                                    setFile(null);
                                    setResult(null);
                                }}>
                                ≪ BACK
                            </Button>
                            <Image
                                src={file.url}
                                alt='preview'
                                unoptimized
                                crossOrigin='anonymous'
                                height={300}
                                width={300}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                    )}
                </Box>
            </Grid>

            <Grid size={{ md: 6, xs: 12 }}>
                {file === null && (
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Typography variant="h5">---</Typography>
                            <Typography variant="subtitle2">---</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <div className="w-full h-[300px] border border-dashed border-gray-400" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <div className="w-full h-[300px] border border-dashed border-gray-400" />
                        </Grid>
                    </Grid>
                )}
                {result === null && file !== null && (
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <Typography variant="h5"><Skeleton width="50%" /></Typography>
                            <Typography variant="subtitle2"><Skeleton /></Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Skeleton height={300} variant='rounded' />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Skeleton height={300} variant='rounded' />
                        </Grid>
                    </Grid>
                )}
                {result !== null && result.similar.length === 0 && (
                    <>
                        <Typography variant="h5">No similar images found</Typography>
                        <Typography variant="subtitle2">
                            Image hash: {result.hash}
                        </Typography>
                    </>
                )}
                {result !== null && result.similar.length > 0 && (
                    <>
                        <Typography variant="h5">
                            {result.similar.length} similar images found
                        </Typography>
                        <Typography variant="subtitle2">
                            Image hash: {result.hash}
                        </Typography>
                        <Grid container spacing={1}>
                            {result.similar.map(val => (
                                <Grid size={{ xs: 12, md: 6 }} key={val.id}>
                                    <PostGrid value={val} newTab />
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}

            </Grid>
        </Grid >
    );
}
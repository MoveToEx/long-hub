'use client';

import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import _ from 'lodash';
import TagRow from '@/components/TagRow';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar, EnqueueSnackbar } from 'notistack';
import { useState, useEffect, useMemo } from 'react';
import PostResponse from '@/lib/types/PostResponse';

async function CopyImage(url: string, blob: Blob, enqueueSnackbar: EnqueueSnackbar) {
    const write = (blobs: Record<string, Blob>) => {
        const item = new ClipboardItem(blobs);
        navigator.clipboard.write([item])
            .then(() => enqueueSnackbar('Copied to clipboard', { variant: 'success' }))
            .catch(() => enqueueSnackbar('Failed when writing to clipboard', { variant: 'error' }));
    }

    if (blob.type === 'image/gif') {
        enqueueSnackbar('Only first frame of animated images will be copied.', { variant: 'warning' });
    }

    if (blob.type === 'image/png') {
        write({
            [blob.type]: blob
        });
    }
    else {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const image = document.createElement('img');
        if (context === null) throw new Error('unable to get canvas context');

        image.onload = (e) => {
            if (e === null || e.target === null) return;
            const elem = e.target as HTMLImageElement;

            canvas.width = elem.naturalWidth;
            canvas.height = elem.naturalHeight;
            context?.drawImage(elem, 0, 0);
            canvas.toBlob((pngBlob) => {
                if (pngBlob === null) throw new Error('unable to convert to png blob');

                write({
                    'text/html': new Blob(['<img src="' + url + '"></img>'], { type: 'text/html' }),
                    [pngBlob.type]: pngBlob,
                    [`web ${blob.type}`]: blob
                });

            }, "image/png");
        };
        image.src = URL.createObjectURL(blob);
    }
}

export default function Post({
    params
}: {
    params: {
        id: String
    }
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [post, setPost] = useState<PostResponse | null>(null);
    const [imgBlob, setImgBlob] = useState<Blob | null>(null);
    const [imgObjectURL, setImgObjectURL] = useState<string | null>(null);
    let imgElement;

    useEffect(() => {
        fetch('/api/post/' + params.id, {
            next: {
                revalidate: 600
            }
        })
            .then(x => x.json())
            .then(x => setPost(x));
    }, [params.id]);

    useEffect(() => {
        if (!post?.imageURL) return;

        fetch(post.imageURL)
            .then(x => x.blob())
            .then(x => setImgBlob(x));
    }, [post]);

    useEffect(() => {
        if (imgBlob === null) return;

        setImgObjectURL(URL.createObjectURL(imgBlob));
    }, [imgBlob]);


    if (post == null || imgObjectURL === null) {
        imgElement = (
            <Stack alignItems="center" sx={{ pt: 5 }}>
                <CircularProgress />
            </Stack>
        );
    }
    else {
        imgElement = (
            <Image
                src={imgObjectURL ?? ''}
                unoptimized
                width={0}
                height={500}
                alt={params.id as string}
                style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain'
                }}
                onClick={() => {
                    if (imgBlob === null) return;

                    CopyImage(post.imageURL, imgBlob, enqueueSnackbar);
                }}
            />
        );
    }
    return (
        <>
            <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
                <Grid item xs={12} md={4}>
                    {imgElement}
                </Grid>
                <Grid item xs={12} md={8} sx={{ marginTop: '16px' }}>
                    <Stack alignItems="right" spacing={1}>
                        <div>
                            Text: {post?.text ? post.text : <i>No text</i>}
                        </div>
                        <div>
                            Uploaded at: {post?.createdAt ?? '...'}
                        </div>
                        <div>
                            Tags:
                            <TagRow tags={post?.tags.map((e: any) => e.name) ?? []} />
                        </div>
                        <div>
                            <Typography component="legend">Aggressiveness</Typography>
                            <Rating
                                value={post?.aggr ?? 0}
                                precision={0.5}
                                max={10}
                                size="large"
                                readOnly
                            />
                        </div>
                    </Stack>
                </Grid>
            </Grid>
            <Fab size="large" color="primary" sx={{
                position: 'absolute',
                right: '32px',
                bottom: '32px'
            }} href={`/post/${params.id}/edit`}>
                <EditIcon />
            </Fab>
        </>

    )
}
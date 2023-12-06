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
import { useState, useEffect, useMemo, useRef } from 'react';
import PostResponse from '@/lib/types/PostResponse';
import Link from 'next/link';

async function CopyImage(img: HTMLImageElement | null, enqueueSnackbar: EnqueueSnackbar) {
    if (!img) {
        enqueueSnackbar('Uncompressed image is still loading', { variant: 'info' });
        return;
    }
    const write = (blobs: Record<string, Blob>) => {
        const item = new ClipboardItem(blobs);
        navigator.clipboard.write([item])
            .then(() => enqueueSnackbar('Copied to clipboard', { variant: 'success' }))
            .catch((e) => enqueueSnackbar('Failed when copying: ' + e, { variant: 'error' }));
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context === null) throw new Error('unable to get canvas context');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.drawImage(img, 0, 0);

    canvas.toBlob((pngBlob) => {
        if (pngBlob === null) throw new Error('unable to convert to png blob');

        write({
            [pngBlob.type]: pngBlob
        });

    }, "image/png");
}

export default function Post({
    params
}: {
    params: {
        id: string
    }
}) {
    const { enqueueSnackbar } = useSnackbar();
    const [post, setPost] = useState<PostResponse | null>(null);
    const image = useRef<HTMLImageElement>(null);
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

    if (post == null) {
        imgElement = (
            <Stack alignItems="center" sx={{ pt: 5 }}>
                <CircularProgress />
            </Stack>
        );
    }
    else {
        imgElement = (
            <Image
                ref={image}
                unoptimized
                crossOrigin="anonymous"
                src={post.imageURL}
                width={300}
                height={500}
                alt={params.id}
                style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain'
                }}
                onClick={() => {
                    CopyImage(image.current, enqueueSnackbar);
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
                            Text: {post ? post.text : <i>No text</i>}
                        </div>
                        <div>
                            Uploaded at: {post?.createdAt ?? '...'}
                        </div>
                        <div>
                            Tags:
                            <TagRow tags={post?.tags.map(e => e.name) ?? []} />
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
            }} LinkComponent={Link} href={`/post/${params.id}/edit`}>
                <EditIcon />
            </Fab>
        </>

    )
}
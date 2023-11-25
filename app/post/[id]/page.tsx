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
import { useState, useEffect } from 'react';
import { PostDetailResponse } from '@/lib/PostResponse';

async function CopyImage(url: string | null, enqueueSnackbar: EnqueueSnackbar) {
    if (url === null) return;

    const blob = await fetch(url).then(x => x.blob());
    let clipItem;

    if (blob.type === 'image/gif') {
        enqueueSnackbar('Only first frame of animated images will be copied.', { variant: 'warning' });
    }

    if (blob.type === 'image/png') {
        clipItem = new ClipboardItem({
            [blob.type]: blob
        });

        navigator.clipboard.write([clipItem])
            .then(() => enqueueSnackbar('Copied to clipboard', { variant: 'success' }))
            .catch(() => enqueueSnackbar('Failed when writing to clipboard', { variant: 'error' }));
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
            context.drawImage(elem, 0, 0);
            canvas.toBlob((blob) => {
                if (blob === null) throw new Error('unable to convert to png blob');

                navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
                    .then(() => enqueueSnackbar('Copied to clipboard', { variant: 'success' }))
                    .catch(() => enqueueSnackbar('Failed when writing to clipboard', { variant: 'error' }));

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
    const [post, setPost] = useState<PostDetailResponse | null>(null);

    useEffect(() => {
        fetch(process.env.NEXT_PUBLIC_BACKEND_HOST + '/post/' + params.id, {
            next: {
                revalidate: 600
            }
        })
            .then(x => x.json())
            .then(x => setPost(x));
    }, [params.id]);

    let imgElement;

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
                src={post.imageURL}
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
                    CopyImage(post?.imageURL, enqueueSnackbar);
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
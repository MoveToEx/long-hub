'use client';

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import _ from 'lodash';
import { useSnackbar } from 'notistack';
import { usePost } from '@/app/context';
import { Rating } from '@prisma/client';
import PostImage from '@/components/post/PostImage';
import RequiresLogin from '@/components/RequiresLogin';
import MetadataForm from '@/components/edit/MetadataForm';
import { useCompositeState } from '@/lib/hooks';

export default function Post({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const [submitting, setSubmitting] = useState(false);
    const initialized = useRef(false);
    const { state: meta, setSingle: set, reset, setMany } = useCompositeState({
        text: '',
        rating: Rating.none as Rating,
        tags: [] as string[],
    });
    const post = usePost(id);

    const { enqueueSnackbar } = useSnackbar();
    const router = useRouter();

    useEffect(() => {
        if (post.data && !initialized.current) {
            initialized.current = true;
            setMany({
                text: post.data.text,
                tags: post.data.tags.map(x => x.name),
                rating: post.data.rating
            });
        }
    }, [post, setMany]);

    function submit() {
        setSubmitting(true);
        fetch('/api/post/' + id, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meta)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                router.push('/post/' + id);
            })
            .catch(reason => {
                enqueueSnackbar(reason, { variant: 'error' });
            })
            .finally(() => {
                setSubmitting(false);
            });
    }

    return (
        <Grid container spacing={2} sx={{ m: 2 }}>
            <RequiresLogin />
            <Grid size={{ xs: 12, md: 4 }}>
                <PostImage id={id} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} sx={{ p: 2 }} component={Paper}>
                <MetadataForm
                    value={meta}
                    reducer={(key, val) => set(key, val)} />
                <Box className='flex flex-row justify-around items-center'>
                    <Button
                        onClick={submit}
                        color="primary"
                        variant='contained'
                        startIcon={<SendIcon />}
                        loading={submitting || post.isLoading}>
                        SUBMIT
                    </Button>
                </Box>
            </Grid>
        </Grid>
    )
}
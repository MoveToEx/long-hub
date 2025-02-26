'use client';

import Grid from '@mui/material/Grid2';
import Image from 'next/image';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';
import { use, useActionState, useEffect } from 'react';
import _ from 'lodash';
import { usePost } from '@/app/context';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import RequiresLogin from '@/components/RequiresLogin';
import { SubmitRequest } from './actions';
import { useRouter } from 'next/navigation';

export default function Post({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const [state, action, pending] = useActionState(SubmitRequest, '');
    const router = useRouter();
    const { data, isLoading } = usePost(id);

    useEffect(() => {
        if (!isLoading && data) {
            if (data.deletedAt !== null) {
                router.replace('/post/' + id);
            }
        }
    }, [data, isLoading, id, router]);

    return (
        <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
            <RequiresLogin />
            <Grid size={{ xs: 12, md: 4 }}>
                {data &&
                    <Image
                        className="w-full h-auto max-h-80 object-contain"
                        crossOrigin='anonymous'
                        alt="Preview"
                        unoptimized
                        src={data.imageURL}
                        height={320}
                        width={320} />}
            </Grid>
            <Grid size={{ xs: 12, md: 8 }} sx={{ mt: 2 }}>
                <Typography variant='h5'>Deletion request on #{id}</Typography>
                <Stack spacing={2} alignItems="center" direction="column" sx={{ m: 2 }}>
                    {state && <Alert severity='error'> {state} </Alert>}
                    <Box
                        alignItems="center"
                        component="form"
                        action={action}
                        gap={2}
                        className="flex flex-col w-full">
                        <input type="hidden" name="request-post-id" value={id} />

                        <FormControl fullWidth>
                            <InputLabel id="reason-label">Deletion reason</InputLabel>
                            <Select
                                labelId="reason-label"
                                label="Deletion reason"
                                name="request-type"
                                defaultValue="other"
                                required>
                                <MenuItem value="duplicate">Is duplicate of another post (fill in id below)</MenuItem>
                                <MenuItem value="superior">Has superior alternative (fill in id below)</MenuItem>
                                <MenuItem value="violation">Does not meet eligibility described in document</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            name="request-details"
                            label="Additional details" />
                        
                        <Typography variant="subtitle1"> Existing pending requests for this post by you will be replaced. </Typography>

                        <Fab color="primary" disabled={isLoading || pending} type="submit">
                            <SendIcon />
                        </Fab>

                    </Box>

                </Stack>
            </Grid>
        </Grid>
    )
}
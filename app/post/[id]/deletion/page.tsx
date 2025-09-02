'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import CancelIcon from '@mui/icons-material/Cancel';
import Typography from '@mui/material/Typography';
import { use, useActionState, useEffect } from 'react';
import _ from 'lodash';
import { usePost } from '@/app/context';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import RequiresLogin from '@/components/RequiresLogin';
import { CancelRequest, HasPendingRequest, SubmitRequest } from './actions';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { CircularProgress } from '@mui/material';
import PostImage from '@/components/post/PostImage';

export default function Post({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const hasPendingRequest = useSWR(['__action_HasPendingRequest', id], ([_, id]) => HasPendingRequest(id));
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
        <Grid container spacing={2} sx={{ m: 2 }}>
            <RequiresLogin />
            <Grid size={{ xs: 12, md: 4 }}>
                <PostImage id={id} />
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

                        <Box className="w-full flex flex-wrap justify-evenly">
                            <Button
                                color="primary"
                                disabled={isLoading || pending}
                                startIcon={<SendIcon />}
                                type="submit">
                                SUBMIT
                            </Button>

                            <Box className="relative">
                                <Button
                                    color="error"
                                    disabled={hasPendingRequest.isLoading || hasPendingRequest.data === false}
                                    startIcon={<CancelIcon />}
                                    onClick={e => CancelRequest(id)}
                                    type="button">
                                    CANCEL MY REQUEST
                                </Button>

                                {hasPendingRequest.isLoading && (
                                    <CircularProgress
                                        size={24}
                                        className="absolute top-1/2 left-1/2 -mt-3 -ml-3"
                                    />
                                )}
                            </Box>
                        </Box>

                        <Typography variant="subtitle2"> Your existing requests for this post will be replaced. </Typography>
                        <Typography variant="subtitle2"> All requests are publicly visible. Do not include personal information. </Typography>
                    </Box>

                </Stack>
            </Grid>
        </Grid>
    )
}
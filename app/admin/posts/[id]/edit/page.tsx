import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { notFound } from "next/navigation";
import Rating from '@mui/material/Rating';
import Grid from '@mui/material/Unstable_Grid2';

import { Post } from "@/lib/db";
import _ from 'lodash';
import { EditPost } from './actions';
import Link from 'next/link';
import Image from 'next/image';

export default async function EditUserPage({
    params
}: {
    params: {
        id: string
    }
}) {
    const post = await Post.findByPk(params.id);

    if (!post) {
        return notFound();
    }

    return (
        <Box sx={{ m: 2 }}>
            <Typography variant="h5">
                Editing post #{post.id}
            </Typography>
            <Grid container>
                <Grid xs={12} md={4}>
                    <Image
                        src={post.imageURL!}
                        alt={post.id}
                        width={300}
                        height={300}
                        style={{
                            maxHeight: '100%',
                            objectFit: 'contain'
                        }} />
                </Grid>
                <Grid xs={12} md={8}>

                    <Box sx={{ p: 2, m: 2 }} component="form" action={EditPost}>
                        <Box sx={{ mt: 2, mb: 4 }}>
                            <Stack direction="column" spacing={2}>
                                <TextField label="ID" name="id" defaultValue={post.id} fullWidth inputProps={{
                                    readOnly: true
                                }} />
                                <TextField label="Text" name="text" defaultValue={post.text} fullWidth />
                                <TextField label="Upload ID" name="uploaderId" defaultValue={post.uploaderId} fullWidth />
                                <TextField label="Image Hash" defaultValue={parseInt(post.imageHash!, 2).toString(16).toUpperCase()} fullWidth inputProps={{
                                    readOnly: true
                                }} />
                                <Box alignItems="center">
                                    <Typography component="legend">Aggressiveness</Typography>
                                    <Rating
                                        defaultValue={post.aggr ?? 0}
                                        precision={0.5}
                                        max={10}
                                        size="large"
                                        name="aggr"
                                    />
                                </Box>
                            </Stack>

                        </Box>
                        <Stack direction="row" alignSelf="center" justifyContent="center" spacing={2}>
                            <Button variant="contained" type="submit" startIcon={<CheckIcon />}>
                                Submit
                            </Button>

                            <Button startIcon={<CloseIcon />} LinkComponent={Link} href="/admin/posts/">
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}
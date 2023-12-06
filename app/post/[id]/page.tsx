import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import _ from 'lodash';
import TagRow from '@/components/TagRow';
import CopiableImage from '@/components/CopiableImage';
import { Post, Tag } from '@/lib/db';
import Link from 'next/link';

export default async function PostPage({
    params
}: {
    params: {
        id: string
    }
}) {
    const post = await Post.findByPk(params.id, {
        include: [
            {
                model: Tag
            }
        ]
    });

    if (post === null) {
        return;
    }

    return (
        <>
            <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
                <Grid item xs={12} md={4}>
                    <CopiableImage
                        src={post.imageURL!}
                        alt={params.id}
                    />
                </Grid>
                <Grid item xs={12} md={8} sx={{ marginTop: '16px' }}>
                    <Stack alignItems="right" spacing={1}>
                        <div>
                            Text: {post.text ? post.text : <i>No text</i>}
                        </div>
                        <div>
                            Uploaded at: {post.createdAt.toLocaleDateString() ?? '...'}
                        </div>
                        <div>
                            Tags:
                            <TagRow tags={post.tags.map(e => e.name) ?? []} />
                        </div>
                        <div>
                            <Typography component="legend">Aggressiveness</Typography>
                            <Rating
                                value={post.aggr}
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
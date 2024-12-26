import _ from 'lodash';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid2';
import PostGridItem from '@/components/PostGridItem';
import PostListItem from '@/components/PostListItem';

function GridSkeleton({
    count
}: {
    count: number
}) {
    return (
        <Box sx={{ m: 1 }}>
            <Grid container spacing={2}>
                {
                    _.range(count).map(i => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i.toString()}>
                            <Skeleton variant="rectangular" height={300} sx={{ width: '100%' }} />
                        </Grid>
                    ))
                }
            </Grid>
        </Box>
    )
}

function ListSkeleton({
    count
}: {
    count: number
}) {
    return (
        <Box sx={{ mt: 1, mb: 1 }}>
            <Grid container spacing={2}>
                {
                    _.range(count).map(i => (
                        <Grid size={{ xs: 12, md: 8 }} offset={{ md: 2 }} key={i.toString()}>
                            <Skeleton variant="rectangular" height={150} sx={{ width: '100%' }} />
                        </Grid>
                    ))
                }
            </Grid>
        </Box>
    )
}

function GridLayout({
    posts,
    copy
}: {
    posts: {
        id: string,
        text?: string,
        imageURL: string,
    }[] | undefined,
    copy: boolean
}) {
    if (posts === undefined) return <></>
    return (
        <Box sx={{ m: 1 }}>
            <Grid container spacing={2}>
                {
                    posts.map(post => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={post.id}>
                            <PostGridItem value={post} />
                        </Grid>
                    ))
                }
            </Grid>
        </Box>
    )
}

function ListLayout({
    posts,
    copy
}: {
    posts: {
        id: string,
        text?: string,
        imageURL: string,
        tags: { name: string }[]
    }[] | undefined,
    copy: boolean
}) {
    if (posts === undefined) return <></>
    return (
        <Box sx={{ m: 1 }}>
            <Grid container spacing={2}>
                {
                    posts.map(post => (
                        <Grid size={{ xs: 12, md: 8 }} offset={{ md: 2 }} key={post.id}>
                            <PostListItem value={post} />
                        </Grid>
                    ))
                }
            </Grid>
        </Box>
    )
}

export default function Posts({
    skeleton,
    copy = false,
    layout,
    posts
}: {
    skeleton?: number | undefined,
    copy?: boolean,
    layout: 'grid' | 'list',
    posts: {
        id: string,
        text?: string,
        imageURL: string,
        tags: { name: string }[]
    }[] | undefined
}) {
    if (posts === undefined && skeleton) {
        if (layout === 'grid') {
            return <GridSkeleton count={skeleton} />
        } else {
            return <ListSkeleton count={skeleton} />
        }
    }
    if (layout === 'grid') {
        return <GridLayout posts={posts} copy={copy} />
    } else {
        return <ListLayout posts={posts} copy={copy} />
    }
}
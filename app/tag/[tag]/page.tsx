import Typography from '@mui/material/Typography';
import TagIcon from '@mui/icons-material/Tag';
import _ from 'lodash';
import LinkImageGrid from '@/components/LinkImageGrid';
import { Tag } from '@/lib/db';
import * as C from '@/lib/constants';
import Pagination from '@/components/Pagination';
import EditTag from './components';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';

const pageLimit = C.pageLimit - 2;

export default async function SearchPage({
    params,
    searchParams
}: {
    params: {
        tag: string
    },
    searchParams?: {
        page?: string
    }
}) {
    const page = Number(searchParams?.page ?? 1);
    const tag = await Tag.findOne({
        where: {
            name: params.tag
        }
    });

    if (!tag) return <></>;

    const posts = await tag.getPosts({
        limit: pageLimit,
        offset: (page - 1) * pageLimit,
        order: [['createdAt', 'DESC']]
    });
    const count = await tag.countPosts();

    return (
        <>
            <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                    <Box sx={{maxHeight: '300px', overflow: 'auto'}}>
                        <Typography variant="h3">
                            <TagIcon fontSize="large" />
                            {params.tag}
                        </Typography>

                        <Typography variant="body1">
                            Type: {tag.type || <i>Unset</i>}
                        </Typography>
                        <Typography variant="body1">
                            Total: {count}
                        </Typography>
                        <Typography variant="body1">
                            Summary: {tag.summary || <i>null</i>}
                        </Typography>
                        <Typography variant="body1">
                            {tag.description ? 'Description: ' + tag.description : ''}
                        </Typography>

                        <EditTag tag={params.tag} description={tag.description} summary={tag.summary} type={tag.type} />
                    </Box>
                </Grid>

                <LinkImageGrid
                    expand={true}
                    src={posts.map(x => ({
                        href: `/post/${x.id}`,
                        src: x.imageURL!
                    }))}
                    gridContainerProps={{
                        spacing: 2
                    }}
                    gridProps={{
                        xs: 12,
                        sm: 6,
                        md: 3
                    }} />

            </Grid>
            <Pagination total={Math.ceil(count / pageLimit)} />
        </>
    )
}
import Typography from '@mui/material/Typography';
import TagIcon from '@mui/icons-material/Tag';
import _ from 'lodash';
import LinkImageGrid from '@/components/LinkImageGrid';
import { Tag } from '@/lib/db';
import * as Constant from '@/lib/constants';
import Pagination from '@/components/Pagination';
import { notFound } from 'next/navigation';

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

    if (!tag) return notFound();

    const posts = await tag.getPosts({
        limit: Constant.PAGINATION_LIMIT,
        offset: (page - 1) * Constant.PAGINATION_LIMIT,
        order: [['createdAt', 'DESC']]
    });
    const count = await tag.countPosts();

    return (
        <>
            <Typography variant="h3">
                <TagIcon fontSize="large" />
                {params.tag}
            </Typography>

            <LinkImageGrid
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

            <Pagination total={Constant.pages(count)} />
        </>
    )
}
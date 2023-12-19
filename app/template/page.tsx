import LinkImageGrid from '@/components/LinkImageGrid';
import _ from 'lodash';
import Box from '@mui/material/Box';
import * as Constant from '@/lib/constants';
import { Template } from '@/lib/db';
import Pagination from '@/components/Pagination';

export default async function Home({
    searchParams
}: {
    searchParams?: {
        page?: string
    }
}) {
    const page = Number(searchParams?.page ?? "1");

    const templates = await Template.findAll({
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * Constant.pageLimit,
        limit: Constant.pageLimit
    });
    const count = await Template.count();

    return (
        <Box sx={{ m: 2 }}>
            <LinkImageGrid
                src={templates.map(post => ({
                    href: `/template/${post.name}`,
                    src: post.imageURL!
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
        </Box>
    );
}

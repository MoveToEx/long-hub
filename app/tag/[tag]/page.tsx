import Typography from '@mui/material/Typography';
import TagIcon from '@mui/icons-material/Tag';
import _ from 'lodash';
import LinkImageGrid from '@/components/LinkImageGrid';
import { prisma } from '@/lib/db';
import * as Constant from '@/lib/constants';
import Pagination from '@/components/Pagination';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({
    params
}: {
    params: {
        tag: string
    }
}): Promise<Metadata> {
    return {
        title: '#' + params.tag
    };
}

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
    const tag = await prisma.tag.findFirst({
        where: {
            name: params.tag
        },
        select: {
            _count: {
                select: {
                    posts: true
                }
            }
        }
    });

    if (!tag) return notFound();

    const posts = await prisma.post.findMany({
        where: {
            tags: {
                some: {
                    name: params.tag
                }
            }
        }
    });

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

            <Pagination total={Constant.pages(tag._count.posts)} />
        </>
    )
}
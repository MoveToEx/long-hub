import { ResolvingMetadata, Metadata } from 'next';
import { ReactNode } from 'react';
import _ from 'lodash';

export async function generateMetadata(
    {
        params
    }: {
        params: Promise<{ id: string }>
    },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;

    const post = await prisma.post.findFirst({
        where: {
            id
        },
        select: {
            imageURL: true
        }
    });

    if (post === null) {
        return {
            title: 'Post ???'
        }
    }
    return {
        title: 'Post ' + _.first(id.split('-')),
        openGraph: {
            images: [
                {
                    url: post.imageURL
                }
            ]
        }
    };
}

export default function Layout({ children }: {
    children: ReactNode
}) {
    return children;
}
import { ResolvingMetadata, Metadata } from 'next';
import { ReactNode } from 'react';
import _ from 'lodash';
import { prisma } from '@/lib/db';

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
    return (
        <div className='flex flex-col self-start justify-center w-full'>
            {children}
        </div>
    );
}
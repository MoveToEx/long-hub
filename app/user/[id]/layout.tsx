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

    const user = await prisma.user.findFirst({
        where: {
            id: Number(id)
        }
    });

    if (user === null) {
        return {
            title: 'User page'
        }
    }

    return {
        title: user.name + '\'s user page'
    };
}

export default function Layout({ children }: {
    children: ReactNode
}) {
    return children;
}
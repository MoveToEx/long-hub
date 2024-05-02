import { ResolvingMetadata, Metadata } from 'next';
import { ReactNode } from 'react';
import _ from 'lodash';

export async function generateMetadata(
    { params }: { params: { id: string } },
    parent: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: 'Post ' + _.first(params.id.split('-'))
    };
}

export default function Layout({ children }: {
    children: ReactNode
}) {
    return children;
}
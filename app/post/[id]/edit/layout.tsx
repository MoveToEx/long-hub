import { Metadata } from 'next';
import { ReactNode } from 'react';
import _ from 'lodash';

export async function generateMetadata(
    {
        params
    }: {
        params: Promise<{ id: string }>
    }
): Promise<Metadata> {
    const { id } = await params;
    return {
        title: 'Edit post ' + _.first(id.split('-'))
    };
}

export default function Layout({ children }: {
    children: ReactNode
}) {
    return children;
}
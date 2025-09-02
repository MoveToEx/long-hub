import { ResolvingMetadata, Metadata } from 'next';
import { ReactNode } from 'react';
import _ from 'lodash';

export const metadata: Metadata = {
    title: "User page"
};


export default function Layout({ children }: {
    children: ReactNode
}) {
    return (
        <div className='flex flex-col self-start justify-center w-full'>
            {children}
        </div>
    );
}
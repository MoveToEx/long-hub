import { Metadata } from 'next';
import { ReactNode } from 'react';
import _ from 'lodash';

export const metadata: Metadata = {
    title: 'Admin'
};

export default function Layout({
    children
}: {
    children: ReactNode
}) {
    return (
        <>
            {children}
        </>
    );
}
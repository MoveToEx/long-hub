import { Metadata } from 'next';
import { ReactNode } from 'react';
import _ from 'lodash';

export const metadata: Metadata = {
    title: 'Log in'
};

export default function Layout({
    children
}: {
    children: ReactNode
}) {
    return (
        <div className="flex items-center justify-center">
            {children}
        </div>
    );
}
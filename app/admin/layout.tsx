import { Metadata } from 'next';
import { ReactNode } from 'react';
import _ from 'lodash';
import { auth } from '@/lib/dal';
import { notFound } from "next/navigation";
import * as C from '@/lib/constants';
import { ResponsivePaper, PanelTabs } from './components';

export const metadata: Metadata = {
    title: 'Admin'
};

export default async function Layout({
    tabs
}: {
    tabs: ReactNode
}) {
    const user = await auth();

    if (!user || (user.permission & C.Permission.Admin.base) == 0) {
        notFound();
    }

    return (
        <div className='flex flex-col self-start justify-center w-full'>
            <ResponsivePaper>
                <PanelTabs
                    titles={['dashboard', 'post', 'user', 'tag', 'deletion', 'config']}
                    slot={tabs}
                />
            </ResponsivePaper>
        </div>
    )
}
'use client';

import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';

export default function Page({
    total
}: {
    total: number
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    return (
        <Stack alignItems="center">
            <Pagination
                count={total}
                siblingCount={1}
                showFirstButton
                showLastButton
                page={Number(searchParams.get('page') ?? '1')}
                onChange={(e, v) => {
                    router.push(createQueryString(pathname, {
                        ...searchParams.entries(),
                        page: v
                    }))
                }}
            ></Pagination>
        </Stack>
    )

}
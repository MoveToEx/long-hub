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
                showFirstButton
                showLastButton
                page={Number(searchParams.get('page') ?? '1')}
                onChange={(_, v) => {
                    router.push(createQueryString(pathname, {
                        ...[...searchParams.entries()].reduce((a, x) => ({
                            ...a,
                            [x[0]]: x[1]
                        }), {}),
                        page: v
                    }));
                }}
            ></Pagination>
        </Stack>
    )

}
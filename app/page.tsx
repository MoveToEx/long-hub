'use client';

import LinkImageGrid from '@/components/LinkImageGrid';
import _ from 'lodash';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useState, useEffect, useDeferredValue } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';
import { usePosts } from './post/context';

export default function Home() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
	const { data, error, isLoading } = usePosts((page - 1) * 24, 24);
	const deferredPage = useDeferredValue(C.pages(data?.count ?? 0));

	useEffect(() => {
		setPage(Number(searchParams.get('page') ?? '1'));
	}, [searchParams]);

	return (
		<Box sx={{ m: 2 }}>
			<LinkImageGrid
				skeleton={isLoading ? 24 : 0}
				src={data ? data.data.map(post => ({
					href: `/post/${post.id}`,
					src: post.imageURL
				})) : []}
				gridContainerProps={{
					spacing: 2
				}}
				gridProps={{
					xs: 12,
					sm: 6,
					md: 3
				}} />

			<Stack alignItems="center" sx={{ m: 4 }}>
				<Pagination
					disabled={isLoading}
					count={deferredPage}
					page={page}
					onChange={(_, val) => {
						setPage(val);
						window.scrollTo({
							top: 0
						});
						router.push(createQueryString('/', {
							page: val
						}), {
							scroll: false
						});
					}}
				/>
			</Stack>
		</Box>
	);
}

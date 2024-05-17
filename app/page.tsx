'use client';

import _ from 'lodash';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import { useState, useEffect, useDeferredValue } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';
import { usePosts } from './post/context';
import PostGrid from '@/components/PostGrid';

export default function Home() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
	const { data, isLoading } = usePosts((page - 1) * 24, 24);
	const deferredPage = useDeferredValue(C.pages(data?.count ?? 0));

	useEffect(() => {
		setPage(Number(searchParams.get('page') ?? '1'));
	}, [searchParams]);

	return (
		<Box sx={{ m: 2 }}>
			<Grid container spacing={2}>
				{
					isLoading && _.range(24).map(i => (
						<Grid xs={12} sm={6} md={3} key={i.toString()}>
							<Skeleton variant="rectangular" height={300} sx={{ width: '100%' }} />
						</Grid>
					))
				}
				{
					data && data.data.map(post => (
						<Grid xs={12} sm={6} md={3} key={post.id}>
							<PostGrid value={post} />
						</Grid>
					))
				}
			</Grid>


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

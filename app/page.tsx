'use client';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import LinkImageGrid from '@/components/LinkImageGrid';
import _ from 'lodash';
import { useSearchParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import { PostsResponse } from '@/lib/types/PostResponse';

const PAGINATION_LIMIT = 24;

export default function Home() {
	const searchParam = useSearchParams();
	const router = useRouter();
	const [result, setResult] = useState<PostsResponse | null>(null);
	const [page, setPage] = useState(Number(searchParam.get('page') ?? 1));

	function onPage(e: React.ChangeEvent<unknown>, val: number) {
		router.push('/?page=' + val);
		setPage(val);
		setResult(null);
		window.scroll({
			top: 0,
			left: 0
		});
	}

	useEffect(() => {
		fetch('/api/post/?offset=' + (page * PAGINATION_LIMIT - PAGINATION_LIMIT), { next: { revalidate: 120 } })
			.then(res => res.json())
			.then(x => setResult(x))
			.catch(() => setResult(null));
	}, [page]);

	return (
		<Box sx={{ m: 2 }}>
			<LinkImageGrid
				src={result?.data.map(x => ({
					href: `/post/${x.id}`,
					src: x.imageURL
				}))}
				gridContainerProps={{
					spacing: 2
				}}
				gridProps={{
					xs: 12,
					sm: 6,
					md: 3
				}} />
			<Stack alignItems="center">
				<Pagination
					count={result === null ? 0 : Math.ceil(result.count / PAGINATION_LIMIT)}
					siblingCount={0}
					page={page}
					onChange={onPage}
				></Pagination>
			</Stack>
		</Box>
	);
}

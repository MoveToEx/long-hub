'use client';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useEffect, useState, Suspense } from 'react';
import LinkImageGrid from '@/components/LinkImageGrid';
import _ from 'lodash';
import { useSearchParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import { PostsResponse } from '@/lib/types/PostResponse';
import { createQueryString } from '@/lib/util';

const PAGINATION_LIMIT = 24;

function Home() {
	const searchParam = useSearchParams();
	const router = useRouter();

	const [page, setPage] = useState(Number(searchParam.get('page') ?? 1));
	const [result, setResult] = useState<PostsResponse | null>(null);

	function onPage(e: React.ChangeEvent<unknown>, val: number) {
		if (page == val) return;

		setResult(null);
		setPage(val);
		window.scroll({
			top: 0,
			left: 0
		});
	}

	useEffect(() => {
		const page = Number(searchParam.get('page') ?? 1);
		
		fetch(createQueryString('/api/post/', {
			offset: ((page - 1) * PAGINATION_LIMIT)
		}), { next: { revalidate: 120 }})
			.then(res => res.json())
			.then(x => setResult(x))
			.catch(() => setResult(null));
	}, [searchParam]);

	useEffect(() => {
		router.push(createQueryString('/', {
			page: page
		}));
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


export default function _wrapper() {
	return (
		<Suspense>
			<Home />
		</Suspense>
	)
}
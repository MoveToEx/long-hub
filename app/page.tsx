'use client';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import LinkImageGrid from '@/components/LinkImageGrid';
import _ from 'lodash';
import { useSearchParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';

const PAGINATION_LIMIT = 24;

export default function Home() {
	const searchParam = useSearchParams();
	const router = useRouter();
	const [result, setResult] = useState({});
	const [page, setPage] = useState(Number(searchParam.get('page') ?? 1));

	function onPage(e: React.ChangeEvent<unknown>, val: number) {
		router.push('/?page=' + val);
		setPage(val);
		setResult({});
		window.scroll({
			top: 0,
			left: 0
		});
	}

	useEffect(() => {
		fetch(process.env.NEXT_PUBLIC_BACKEND_HOST + '/post/?offset=' + (page * PAGINATION_LIMIT - PAGINATION_LIMIT), { next: { revalidate: 120 } })
			.then(res => res.json())
			.then(x => setResult(x))
			.catch(() => setResult({}));
	}, [page]);

	return (
		<Box sx={{ m: 2 }}>
			<LinkImageGrid
				src={_.isEmpty(result) ? [] : (result as any).data.map((x: any) => ({
					href: `/post/${x.id}`,
					src: x.imageURL
				}))}
				skeletonHeight={128}
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
					count={_.isEmpty(result) ? 0 : Math.ceil((result as any).count / PAGINATION_LIMIT)}
					siblingCount={0}
					page={page}
					onChange={onPage}
				></Pagination>
			</Stack>
		</Box>
	);
}

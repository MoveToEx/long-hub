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
import { PostResponse } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';

export default function Home() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const [loading, setLoading] = useState(true);
	const [post, setPost] = useState<PostResponse | null>(null);
	const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
	const deferredPage = useDeferredValue(C.pages(post?.count ?? 0));

	useEffect(() => {
		setPage(Number(searchParams.get('page') ?? '1'));
	}, [searchParams]);

	useEffect(() => {
		setLoading(true);
		
		fetch('/api/post?limit=24&offset=' + (page - 1) * 24)
			.then(response => {
				if (!response.ok) {
					throw new Error(response.statusText);
				}
				return response.json();
			})
			.then(data => {
				setPost(data);
			})
			.catch(reason => {
				enqueueSnackbar('Failed: ' + reason, { variant: 'error' });
			}).finally(() => {
				setLoading(false);
			});
	}, [page, enqueueSnackbar]);

	return (
		<Box sx={{ m: 2 }}>
			<LinkImageGrid
				skeleton={loading ? 24 : 0}
				src={post === null ? [] : post.data.map(post => ({
					href: `/post/${post.id}`,
					src: post.imageURL
				}))}
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
					disabled={loading}
					count={deferredPage}
					page={page}
					onChange={(_, val) => {
						router.push(createQueryString('/', {
							page: val
						}));
					}}
				/>
			</Stack>
		</Box>
	);
}

'use client';

import _ from 'lodash';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import { useState, useEffect, useDeferredValue } from 'react';
import { PostsFetcher, usePosts } from '@/app/context';
import { useSnackbar } from 'notistack';
import { preload } from 'swr';
import Posts from '@/components/Posts';
import { useSyncedSearchParams } from '@/lib/hooks';
import ToggleLayout from '@/components/list/ToggleLayout';

export default function Page() {
	const [layout, setLayout] = useState<'grid' | 'list'>('grid');
	const [params, setParams] = useSyncedSearchParams({
		page: {
			defaultValue: 1,
			parser: val => Number(val),
			serializer: val => val.toString()
		}
	});
	const { data, error, isLoading } = usePosts(24, (params.page - 1) * 24);
	const { enqueueSnackbar } = useSnackbar();
	const totalPages = useDeferredValue(C.pages(data?.count ?? 0));

	useEffect(() => {
		if (params.page > 1) {
			preload('/api/post?limit=24&offset=' + 24 * (params.page - 2), PostsFetcher);
		}
		preload('/api/post?limit=24&offset=' + 24 * params.page, PostsFetcher);
	}, [params.page])

	if (error) {
		enqueueSnackbar(error, { variant: 'error' });
	}

	return (
		<Box sx={{ m: 2 }}>
			<Box className="flex justify-end items-end">
				<ToggleLayout value={layout} onChange={val => setLayout(val)} />
			</Box>

			<Posts
				count={24}
				layout={layout}
				posts={data?.data} />

			<Stack alignItems="center" sx={{ my: 4 }}>
				<Pagination
					disabled={isLoading}
					count={totalPages}
					page={params.page}
					onChange={(_, val) => {
						setParams({
							page: val
						});
					}}
				/>
			</Stack>
		</Box>
	);
}

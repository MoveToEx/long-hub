'use client';

import _ from 'lodash';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useState, useEffect, useDeferredValue } from 'react';
import { PostsFetcher, usePosts } from '@/app/context';
import { useSnackbar } from 'notistack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import WindowIcon from '@mui/icons-material/Window';
import ViewListIcon from '@mui/icons-material/ViewList';
import { preload } from 'swr';
import Posts from '@/components/Posts';
import { useSyncedSearchParams } from '@/lib/hooks';

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
				<ToggleButtonGroup size="small" value={layout} exclusive onChange={(event, value) => {
					if (value !== null) {
						setLayout(value);
					}
				}}>
					<Tooltip title="Grid layout">
						<ToggleButton value="grid">
							<WindowIcon />
						</ToggleButton>
					</Tooltip>
					<Tooltip title="List layout">
						<ToggleButton value="list">
							<ViewListIcon />
						</ToggleButton>
					</Tooltip>
				</ToggleButtonGroup>
			</Box>

			<Posts
				skeleton={24}
				layout={layout}
				posts={data?.data} />

			<Stack alignItems="center" sx={{ m: 4 }}>
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

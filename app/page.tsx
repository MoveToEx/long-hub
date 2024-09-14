'use client';

import _ from 'lodash';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid2';
import { useState, useEffect, useDeferredValue } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';
import { usePosts } from './post/context';
import PostGridItem from '@/components/PostGridItem';
import PostListItem from '@/components/PostListItem';
import { useSnackbar } from 'notistack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import WindowIcon from '@mui/icons-material/Window';
import ViewListIcon from '@mui/icons-material/ViewList';

function GridLayout({
	isLoading,
	page,
	deferredPage,
	posts,
	onPagination
}: {
	isLoading: boolean,
	page: number,
	deferredPage: number,
	posts: {
		id: string,
		text?: string,
		imageURL: string,
	}[] | undefined,
	onPagination: (page: number) => void
}) {
	return (
		<Box sx={{ m: 1 }}>
			<Grid container spacing={2}>
				{
					isLoading && _.range(24).map(i => (
						<Grid size={{ xs: 12, sm: 6, md: 3 }} key={i.toString()}>
							<Skeleton variant="rectangular" height={300} sx={{ width: '100%' }} />
						</Grid>
					))
				}
				{
					posts && posts.map(post => (
						<Grid size={{ xs: 12, sm: 6, md: 3 }} key={post.id}>
							<PostGridItem value={post} />
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
						onPagination(val);
					}}
				/>
			</Stack>
		</Box>
	)
}

function ListLayout({
	isLoading,
	page,
	deferredPage,
	posts,
	onPagination
}: {
	isLoading: boolean,
	page: number,
	deferredPage: number,
	posts: {
		id: string,
		text?: string,
		imageURL: string,
		tags: { name: string }[]
	}[] | undefined,
	onPagination: (page: number) => void
}) {
	return (
		<Box sx={{ m: 1 }}>
			<Grid container spacing={2}>
				{
					isLoading && _.range(24).map(i => (
						<Grid size={{ xs: 12, md: 8 }} offset={{ md: 2 }} key={i.toString()}>
							<Skeleton variant="rectangular" height={300} sx={{ width: '100%' }} />
						</Grid>
					))
				}
				{
					posts && posts.map(post => (
						<Grid size={{ xs: 12, md: 8 }} offset={{ md: 2 }} key={post.id}>
							<PostListItem value={post} />
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
						onPagination(val);
					}}
				/>
			</Stack>
		</Box>
	)
}

export default function Home() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [layout, setLayout] = useState<'grid' | 'list'>('grid');
	const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
	const { data, error, isLoading } = usePosts((page - 1) * 24, 24);
	const { enqueueSnackbar } = useSnackbar();
	const deferredPage = useDeferredValue(C.pages(data?.count ?? 0));

	const onPagination = (val: number) => {
		setPage(val);
		window.scrollTo({
			top: 0
		});
		router.push(createQueryString('/', {
			page: val
		}), {
			scroll: false
		});
	}

	useEffect(() => {
		setPage(Number(searchParams.get('page') ?? '1'));
	}, [searchParams]);

	if (error) {
		enqueueSnackbar(error, { variant: 'error' });
	}

	return (
		<Box sx={{ m: 2 }}>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
				<Typography variant="subtitle1">
					{isLoading ? <Skeleton width={200} /> : <>Total: {data?.count} images</>}
				</Typography>
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
			{
				layout == 'grid' ?
					<GridLayout
						isLoading={isLoading}
						page={page}
						deferredPage={deferredPage}
						posts={data?.data}
						onPagination={onPagination} /> :
					<ListLayout
						isLoading={isLoading}
						page={page}
						deferredPage={deferredPage}
						posts={data?.data}
						onPagination={onPagination} />
			}
		</Box>
	);
}

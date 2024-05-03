'use client';

import LinkImageGrid from '@/components/LinkImageGrid';
import _ from 'lodash';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import { useState, useEffect, useDeferredValue, MouseEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { preload } from 'swr';
import { copyImage, createQueryString } from '@/lib/util';
import { usePosts, PostFetcher } from './post/context';
import styles from '@/components/components.module.css';


export default function Home() {
	const searchParams = useSearchParams();
	const { enqueueSnackbar } = useSnackbar();
	const router = useRouter();
	const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
	const { data, error, isLoading } = usePosts((page - 1) * 24, 24);
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
							<Link href={`/post/${post.id}`}>
								<Image
									src={post.imageURL}
									alt={post.text ?? 'No text'}
									height={300}
									width={300}
									style={{
										maxWidth: '100%',
										maxHeight: '300px',
										width: 'auto',
										minWidth: '100%',
										minHeight: '100%',
										objectFit: 'contain',
									}}
									onMouseOver={() => {
										preload(post.id, PostFetcher);
									}}
									onClick={async (event) => {
										if (event.ctrlKey) {
											event.preventDefault();
											event.stopPropagation();

											const element = event.currentTarget as HTMLImageElement;
											element.classList.add(styles['grid-image-fetching']);
											await copyImage(
												element,
												(info) => enqueueSnackbar(info, { variant: 'info' })
											).catch(reason => {
												enqueueSnackbar(reason, { variant: 'error' });
											});
											element.classList.remove(styles['grid-image-fetching']);
											enqueueSnackbar('Copied to clipboard', { variant: 'success' })
										}
									}}
								/>
							</Link>
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

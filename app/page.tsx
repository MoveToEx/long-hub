'use client';

import LinkImageGrid from '@/components/LinkImageGrid';
import _ from 'lodash';
import Box from '@mui/material/Box';
import * as C from '@/lib/constants';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
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
import styles from './page.module.css';

function Post({
	value,
}: {
	value: {
		imageURL: string;
		text: string;
		id: string;
	},
}) {
	const { enqueueSnackbar } = useSnackbar();
	const [copying, setCopying] = useState(false);
	const [progress, setProgress] = useState(0);

	return (
		<Link href={`/post/${value.id}`} style={{
			display: 'block',
			position: 'relative'
		}}>
			<Image
				src={value.imageURL}
				alt={value.text}
				height={300}
				width={300}
				className={copying ? styles['grid-image-fetching'] : ''}
				style={{
					maxWidth: '100%',
					maxHeight: '300px',
					width: 'auto',
					minWidth: '100%',
					minHeight: '100%',
					objectFit: 'contain',
				}}
				onMouseOver={() => {
					preload(value.id, PostFetcher);
				}}
				onClick={async (event) => {
					if (!event.ctrlKey || copying) {
						return;
					}

					setCopying(true);

					event.preventDefault();
					event.stopPropagation();

					const src = value.imageURL;

					if (src.endsWith('gif')) {
						enqueueSnackbar('Only the first frame will be copied', { variant: 'info' });
					}

					const chunks = [];
					const response = await fetch(src);

					if (!response.ok) {
						enqueueSnackbar(response.statusText, { variant: 'error' });
						return;
					}

					if (response.body === null) {
						enqueueSnackbar('Unexpected null body', { variant: 'error' });
						return;
					}

					const reader = response.body.getReader();

					const contentLength = Number(response.headers.get('Content-Length') ?? '0');

					if (contentLength == 0) {
						enqueueSnackbar('Unexpected zero-length response', { variant: 'error' });
						return;
					}

					let received = 0;

					while (1) {
						const { done, value } = await reader.read();

						if (done) {
							break;
						}

						chunks.push(value);
						received += value.length;

						setProgress(received / contentLength * 100);

						await new Promise((resolve) => {
							setTimeout(resolve, 100);
						});
					}

					const blob = new Blob(chunks);

					const items = [];

					if (blob.type === 'image/png') {
						items.push(new ClipboardItem({
							[blob.type]: blob
						}));
						try {
							await navigator.clipboard.write(items);
						}
						catch(e: any) {
							enqueueSnackbar(e, { variant: 'error' });
							setCopying(false);
						}
						return;
					}

					const canvas = document.createElement('canvas');
					const context = canvas.getContext('2d');
					if (context === null) {
						enqueueSnackbar('Unable to get canvas context', { variant: 'error' });
						setCopying(false);
						return;
					}

					await new Promise((resolve, reject) => {
						const image = document.createElement('img');

						image.onload = async (e) => {
							canvas.width = image.naturalWidth;
							canvas.height = image.naturalHeight;
							context.fillStyle = 'white';
							context.fillRect(0, 0, canvas.width, canvas.height);

							context.drawImage(image, 0, 0);

							const blob: Blob | null = await new Promise((_resolve, _reject) => {
								canvas.toBlob(blob => {
									if (blob === null) {
										_reject('Cannot convert canvas to blob');
									}
									else {
										_resolve(blob);
									}
								}, 'image/png');
							});

							if (blob === null) {
								reject('Failed fetching image');
								return;
							}

							try {
								await navigator.clipboard.write([
									new ClipboardItem({
										'image/png': blob
									})
								]);
							}
							catch (e: any) {
								reject(e);
							}

							resolve(null);
						}
						image.src = URL.createObjectURL(blob);
					}).then(() => {
						enqueueSnackbar('Copied to clipboard', { variant: 'success' });
					}).catch(reason => {
						enqueueSnackbar(reason, { variant: 'error' });
					});

					setCopying(false);
					setProgress(0);
				}}
			/>
			{
				copying && <CircularProgress className={styles['progress']} variant="determinate" value={progress} />
			}
		</Link>
	);
}


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
							<Post value={post} />
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

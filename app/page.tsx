'use client';

import _ from 'lodash';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import { PostsFetcher, usePosts, useTags } from './context';
import { useSnackbar } from 'notistack';
import { preload } from 'swr';
import './page.module.css';

import { ContributionChart, NewPostChart, RandomPostGrid, RecentPosts } from './component';
import { useEffect } from 'react';

preload('/api/post?limit=4&offset=0', PostsFetcher);

export default function Home() {
	const tag = useTags();
	const post = usePosts(4);
	const { enqueueSnackbar } = useSnackbar();

	useEffect(() => {
		preload('/api/post?limit=24&offset=0', PostsFetcher);
	}, []);

	if (post.error) {
		enqueueSnackbar(post.error, { variant: 'error' });
	}

	return (
		<Box>
			<Grid container sx={{ m: 2, alignItems: 'stretch' }} spacing={2}>
				<Grid size={{
					xs: 12,
					md: 8
				}}>
					<Paper sx={{ p: 2 }}>
						<Typography align="center" variant="h5" sx={{ pb: 2 }}>
							New post trend
						</Typography>
						<NewPostChart height={128} />
					</Paper>
				</Grid>
				<Grid size={{
					xs: 12,
					md: 4
				}}>
					<Paper sx={{ p: 2 }}>
						<Typography align="center" variant="h5" sx={{ pb: 2 }}>
							Site statistics
						</Typography>
						<Box className="flex flex-row items-center content-center h-32">
							<Box className="flex flex-1 text-center flex-col items-center">
								{tag.isLoading &&
									<Skeleton component="span">
										<Typography variant="h4" component="span">count</Typography>
									</Skeleton>
								}
								{tag.data &&
									<Typography variant="h4" component="span">
										{tag.data.length}
									</Typography>
								}
								<Typography variant="button">
									tags
								</Typography>
							</Box>
							<Divider orientation="vertical" flexItem />
							<Box className="flex flex-1 text-center flex-col items-center">
								{post.isLoading &&
									<Skeleton component="span">
										<Typography variant='h4' component="span">count</Typography>
									</Skeleton>
								}
								{post.data &&
									<Typography variant="h4" component="span">
										{post.data.count}
									</Typography>
								}
								<Typography variant="button">
									posts
								</Typography>
							</Box>
						</Box>
					</Paper>
				</Grid>

				<Grid size={{
					xs: 12,
					md: 3
				}}>
					<Paper sx={{ p: 2 }}>
						<Typography variant="h5" sx={{ mb: 2 }}>Random posts</Typography>
						<RandomPostGrid />
					</Paper>
				</Grid>

				<Grid size={{
					xs: 12,
					md: 9
				}}>
					<Paper sx={{ p: 2 }} className="h-full flex flex-col">
						<Typography variant="h5" sx={{ mb: 2 }} align="center">Contribution</Typography>
						<Box className="flex flex-1 items-center">
							<ContributionChart />
						</Box>
					</Paper>
				</Grid>
			</Grid>

			<Paper sx={{ p: 2, m: 2 }}>
				<Box className="flex flex-row justify-between items-center">
					<Typography variant="h5" component="span">
						Recent posts
					</Typography>
					<Button component={Link} href="/post/list" variant="outlined">
						View all ≫
					</Button>
				</Box>
				<Box sx={{ m: 1 }}>
					<RecentPosts />
				</Box>
			</Paper>
		</Box>
	);
}

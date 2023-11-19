'use client';
import Image from 'next/image';
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'next/link';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import { useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';

const PAGINATION_LIMIT = 24;

function toGridItems(res: any) {
	var elem;
	if (_.isEmpty(res)) {
		elem = _.range(PAGINATION_LIMIT).map((x: number) => (
			<>
				<Skeleton variant="rectangular" height={128} />
				<Skeleton variant="text" height={24} />
				<Skeleton variant="text" height={24} />
			</>
		))
	}
	else {
		elem = res.data.map((e: any) => (
			<Link href={`/post/${e.id}`} key={e.id}>
				<Image
					src={e.imageURL}
					alt={e.text}
					height={0}
					width={0}
					sizes='100vw'
					style={{
						width: '100%',
						height: '300px',
						objectFit: 'contain'
					}}
				/>
			</Link>
		))
	}
	return elem.map((e: any, i: number) => (
		<Grid xs={12} sm={6} md={3} key={i}>
			{e}
		</Grid>
	));
}

export default function Home() {
	const [result, setResult] = useState({});
	const [page, setPage] = useState(1);

	function onPage(e: React.ChangeEvent<unknown>, val: number) {
		setResult({});
		setPage(val);
		window.scroll({
			top: 0,
			left: 0
		});
	}

	useEffect(() => {
		console.log(process.env);
		axios.get(process.env.NEXT_PUBLIC_BACKEND_HOST + '/post/?offset=' + (page * PAGINATION_LIMIT - PAGINATION_LIMIT))
			.then(x => setResult(x.data))
			.catch(x => setResult({}));
	}, [page]);

	return (
		<>
			<Grid container spacing={2}>
				{toGridItems(result as any)}
			</Grid>
			<Stack alignItems="center">
				<Pagination
					count={_.isEmpty(result) ? 0 : Math.ceil((result as any).count / PAGINATION_LIMIT)}
					siblingCount={0}
					page={page}
					onChange={onPage}
				></Pagination>
			</Stack>
		</>
	);
}

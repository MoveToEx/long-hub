'use client';

import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Chip from '@mui/material/Chip';
import TagIcon from '@mui/icons-material/Tag';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import { useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';

export default function Post({
    params
}: {
    params: {
        id: String
    }
}) {
    const [info, setInfo] = useState<any>({});

    useEffect(() => {
        axios.get(process.env.NEXT_PUBLIC_BACKEND_HOST + '/post/' + params.id).then(x => setInfo(x.data));
    }, []);

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    {
                        _.isEmpty(info)
                            ? <></>
                            : <Image
                                src={info.image}
                                width={0}
                                height={0}
                                alt={params.id.toString()}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    objectFit: 'contain'
                                }} sizes="100vw" />
                    }
                </Grid>
                <Grid item xs={12} md={8} sx={{ marginTop: '16px' }}>
                    <Stack alignItems="right" spacing={1}>
                        <div>
                            Text: {info?.text?.length == 0 ? <i>No text</i> : info.text}
                        </div>
                        <div>
                            Uploaded at: {info?.createdAt ?? '...'}
                        </div>
                        <div>
                            Tags:
                            <Stack spacing={1} direction="row" display="inline">
                                {_.isEmpty(info)
                                    ? <></>
                                    : info.tags.length == 0
                                        ? <i> Untagged </i>
                                        : info.tags.map((e: any) => (
                                            <Link href={'/tag/' + e.name} key={e.id}>
                                                <Chip label={e.name} sx={{ fontSize: '16px' }} icon={<TagIcon />} />
                                            </Link>
                                        ))
                                }
                            </Stack>
                        </div>
                        <div>
                            <Typography component="legend">Aggressiveness</Typography>
                            <Rating
                                value={info?.aggr ?? 0}
                                precision={0.5}
                                max={10}
                                size="large"
                                readOnly
                            />
                        </div>
                    </Stack>
                </Grid>
            </Grid>
            <Fab size="large" color="primary" sx={{
                position: 'absolute',
                right: '32px',
                bottom: '32px'
            }} href={`/post/${params.id}/edit`}>
                <EditIcon />
            </Fab>
        </>

    )
}
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import _ from 'lodash';
import TagRow from '@/components/TagRow';

export default async function Post({
    params
}: {
    params: {
        id: String
    }
}) {
    const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_HOST + '/post/' + params.id, {
        cache: 'no-cache'
    });
    const data = await response.json();

    return (
        <>
            <Grid container spacing={2} sx={{pt: 2, pb: 2}}>
                <Grid item xs={12} md={4}>
                    <Image
                        src={data.imageURL}
                        unoptimized
                        width={0}
                        height={0}
                        alt={params.id.toString()}
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain'
                        }} sizes="100vw" />
                </Grid>
                <Grid item xs={12} md={8} sx={{ marginTop: '16px' }}>
                    <Stack alignItems="right" spacing={1}>
                        <div>
                            Text: {data?.text?.length == 0 ? <i>No text</i> : data.text}
                        </div>
                        <div>
                            Uploaded at: {data?.createdAt ?? '...'}
                        </div>
                        <div>
                            Tags:
                            <TagRow tags={data.tags.map((e: any) => e.name)} />
                        </div>
                        <div>
                            <Typography component="legend">Aggressiveness</Typography>
                            <Rating
                                value={data.aggr ?? 0}
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
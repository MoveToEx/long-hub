import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';

export default async function PostLoading() {
    return (
        <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
            <Grid xs={12} md={4}>
                <Skeleton variant='rectangular' height={300} />
            </Grid>
            <Grid xs={12} md={6} sx={{ marginTop: '16px' }}>
                <Stack spacing={1}>
                    <Skeleton variant='text' />
                    <Skeleton variant='text' />
                    <Skeleton variant='text' />
                    <Skeleton variant='text' />
                </Stack>
            </Grid>
        </Grid>
    );
}
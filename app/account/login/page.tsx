'use client';

import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useActionState } from 'react';
import _ from 'lodash';


import login from './action';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context';
import SubmitButton from '@/components/SubmitButton';

export default function SigninPage() {
    const { data: user } = useUser();
    const router = useRouter();
    const [state, action] = useActionState(login, '');

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);


    return (
        <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography component="h1" variant="h5">
                Log in
            </Typography>
            <Box component="form" action={action} sx={{ mt: 1 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="User name"
                    name="username"
                    autoComplete="off"
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                />
                <FormControlLabel control={<Checkbox name='extend' />} label="Keep me logged in for a month" />
                <SubmitButton label="Log in" />
                <Typography color="error">
                    {state}
                </Typography>
                <Grid container justifyContent="flex-end">
                    <Grid>
                        <Link href="/account/signup" variant="body2">
                            {"Don't have an account? Sign Up"}
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}
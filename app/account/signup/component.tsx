'use client';

import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useFormState } from 'react-dom';

import signUp from './action';
import SubmitButton from '@/components/SubmitButton';
import Turnstile from '@/components/Turnstile';

export default function SignupPage({ turnstileKey }: { turnstileKey: string | undefined }) {
    const [state, action] = useFormState(signUp, '');

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
                Sign up
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
                    autoComplete="new-password"
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password-confirm"
                    label="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                />
                {
                    turnstileKey && <Turnstile clientKey={turnstileKey} />
                }
                <SubmitButton label="Sign up" />

                <Typography color="error">
                    {state}
                </Typography>

                <Grid container justifyContent="flex-end">
                    <Grid>
                        Already have an account?
                        <Link href="/account/login" variant="body2">
                            Log in
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    )
}
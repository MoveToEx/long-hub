'use client';

import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import MUILink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useActionState, useEffect, useRef } from 'react';

import Link from 'next/link';
import signUp from './action';
import SubmitButton from '@/components/SubmitButton';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';

export default function SignupPage({ turnstileKey }: { turnstileKey: string }) {
    const [state, action] = useActionState(signUp, null);
    const ref = useRef<TurnstileInstance | null>(null);

    useEffect(() => {
        ref.current?.reset();
    }, [state]);

    return (
        <Box className="flex flex-col items-center">
            <Typography variant="h4">
                Sign up
            </Typography>
            <Box component="form" action={action} sx={{ mt: 1 }}>
                {state &&
                    <Alert severity={state.error ? 'error' : 'success'}>
                        {state.message}
                    </Alert>
                }
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="User name"
                    name="username"
                    autoComplete="off" />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    autoComplete="new-password" />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password-confirm"
                    label="Confirm Password"
                    type="password"
                    autoComplete="new-password" />
                <Turnstile ref={ref} siteKey={turnstileKey} />
                <SubmitButton label="Sign up" />

                <Box className="flex justify-end">
                    <Typography variant="body2">
                        Already have an account?
                        <Link href="/account/login">
                            <MUILink>
                                Log in
                            </MUILink>
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}
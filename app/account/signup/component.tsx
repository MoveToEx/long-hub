'use client';

import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import MUILink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useActionState, useContext, useEffect, useRef } from 'react';
import { ModalContext } from '@/components/Modal';

import Link from 'next/link';
import signUp from './action';
import SubmitButton from '@/components/SubmitButton';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useRouter } from 'next/navigation';

export default function SignupPage({ turnstileKey }: { turnstileKey: string }) {
    const [state, action] = useActionState(signUp, null);
    const ref = useRef<TurnstileInstance | null>(null);
    const modalContext = useContext(ModalContext);
    const router = useRouter();

    useEffect(() => {
        ref.current?.reset();
    }, [state]);

    useEffect(() => {
        if (state?.error === false) {
            if (modalContext) {
                modalContext.close();
            }
            else {
                router.back();
            }
        }
    }, [state, router, modalContext]);

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
                        <MUILink component={Link} href="/account/login">
                            Log in
                        </MUILink>
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}
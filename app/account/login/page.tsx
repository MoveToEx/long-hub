'use client';

import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import MUILink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import { useActionState, useContext } from 'react';
import _ from 'lodash';

import Link from 'next/link';
import login from './action';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context';
import SubmitButton from '@/components/SubmitButton';
import { ModalContext } from '@/components/Modal';

export default function SigninPage() {
    const { data: user, mutate } = useUser();
    const router = useRouter();
    const [state, action] = useActionState(login, null);
    const modalContext = useContext(ModalContext);

    useEffect(() => {
        if (state?.error === false) {
            mutate();
        }
    }, [state, mutate]);

    useEffect(() => {
        if (user) {
            if (modalContext) {
                modalContext.close();
            }
            else {
                router.back();
            }
        }
    }, [user, router, modalContext]);

    return (
        <Box className="flex flex-col items-center content-center">
            <Typography variant="h4">
                Log in to LONG Hub
            </Typography>
            <Typography variant="h6" color="text.secondary">
                Welcome back, mother killer
            </Typography>
            <Box component="form" sx={{ mt: 1 }} action={action}>
                {state &&
                    <Alert severity={state.error ? 'error' : 'success'}>{state.message}</Alert>
                }
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
                <FormControlLabel control={<Checkbox name='extend' />} label="Remember me" />
                <SubmitButton label="Log in" />
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <Typography variant="body2">
                        Don&apos;t have an account?
                        <Link href="/account/signup">
                            <MUILink>
                                Sign Up
                            </MUILink>
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}
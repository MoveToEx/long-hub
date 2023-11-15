'use client';

import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useFormState } from 'react-dom';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import signUp from './action';


export default function SignupPage() {
    const [signUpState, signUpAction] = useFormState(signUp, '');
    const [snackbar, setSnackbar] = useState<any>({ open: false });

    useEffect(() => {
        if (signUpState != 'ok') {
            setSnackbar({
                open: true,
                severity: 'error',
                content: 'Failed: ' + signUpState
            });
        }
    }, [signUpState]);

    return (
        <>
            <Snackbar
                open={snackbar.open ?? false}
                autoHideDuration={2000}
                onClose={() => { setSnackbar({ ...snackbar, open: false }); }}>
                <Alert variant="filled" severity={snackbar.severity}>
                    {snackbar.content ?? ''}
                </Alert>
            </Snackbar>
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
                <Box component="form" action={signUpAction} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="User name"
                        name="username"
                        autoComplete="off"
                        autoFocus
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
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid>
                            <Link href="/account/signin" variant="body2">
                                {"Already have an account? Sign in"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

        </>
    )
}
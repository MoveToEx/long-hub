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
import { useRouter } from 'next/navigation';
import signIn from './action';
import _ from 'lodash';


export default function SigninPage() {
    const [signInState, signInAction] = useFormState(signIn, {} as any);
    const [snackbar, setSnackbar] = useState<any>({ open: false });

    useEffect(() => {
        if (_.isEmpty(signInState)) return;
        
        if (signInState.code != 0) {
            setSnackbar({
                open: true,
                severity: 'error',
                content: 'Failed: ' + signInState.info
            });
        }
    }, [signInState]);

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
                    Sign in as a Mother-Killer
                </Typography>
                <Box component="form" action={signInAction} noValidate sx={{ mt: 1 }}>
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
                        Sign In
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid>
                            <Link href="/account/signup" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

        </>
    )
}
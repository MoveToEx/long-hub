'use client';

import { useEffect, useState } from "react";
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import AccountCircle from "@mui/icons-material/AccountCircle";
import AutorenewIcon from '@mui/icons-material/Autorenew';

import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useUser } from "../context";
import { useRouter } from "next/navigation";
import Skeleton from '@mui/material/Skeleton';

import { useSnackbar } from "notistack";

import style from './page.module.css';

interface UserInfo {
    id: number,
    email?: string,
    name: string,
    permission: number,
    accessKey: string,
    createdAt: Date
}

function permission(p: number) {
    let res = [];
    if (p & 0x2) {
        res.push('write');
    }
    if (p & 0x4) {
        res.push('delete');
    }
    return res.join();
}

function CopiableText({
    text
}: {
    text: string
}) {
    const { enqueueSnackbar } = useSnackbar();

    const copy = async () => {
        await navigator.clipboard.writeText(text);
        enqueueSnackbar('Copied to clipboard', { variant: 'success' });
    }
    return (
        <span className={style.copiable} onClick={() => { copy() }}>
            {text}
        </span>
    )
}

export default function AccountPage() {
    const { data: user, isLoading } = useUser();
    const router = useRouter();
    const [resetDisabled, setResetDisabled] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        if (user === null) {
            router.push('/account/login');
        }

        fetch('/api/account')
            .then(response => response.json())
            .then(data => setUserInfo(data));
    }, [router, user]);

    return (
        <Box sx={{ mt: 4 }}>
            <Grid container>
                <Grid xs={12} md={6}>
                    <Paper sx={{ m: 1 }}>
                        <Box sx={{ p: 1 }}>
                            <Typography variant="h4" sx={{ m: 2 }}>
                                {
                                    !isLoading && userInfo ?
                                        <Stack direction="row" alignItems="center">
                                            <AccountCircle fontSize="large" />{userInfo.name}
                                        </Stack>
                                        : <Skeleton />
                                }

                            </Typography>

                        </Box>
                        <Divider />

                        <Box sx={{ p: 2 }}>

                            <Typography variant="body2">
                                {!isLoading && userInfo ?
                                    <>
                                        Access Key: <CopiableText text={userInfo.accessKey} />
                                    </> : <Skeleton />}
                            </Typography>

                            <Typography variant="body2">
                                {!isLoading && userInfo ? 'Permission: ' + permission(userInfo.permission) : <Skeleton />}
                            </Typography>

                            <Typography variant="body2">
                                {!isLoading && userInfo ? 'Registered at ' + userInfo.createdAt : <Skeleton />}
                            </Typography>


                            <Button
                                onClick={function (e) {
                                    setResetDisabled(true);
                                    fetch('/api/account/reset-key').then(() => {
                                        window.location.reload();
                                    });
                                }}
                                disabled={resetDisabled}
                            >
                                <AutorenewIcon /> reset access key
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
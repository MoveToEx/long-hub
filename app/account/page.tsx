'use client';

import { useEffect, useState } from "react";
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import AccountCircle from "@mui/icons-material/AccountCircle";
import AutorenewIcon from '@mui/icons-material/Autorenew';
import KeyIcon from '@mui/icons-material/Key';
import TodayIcon from '@mui/icons-material/Today';
import TagIcon from '@mui/icons-material/Tag';

import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useUser } from "../context";
import { useRouter } from "next/navigation";
import Skeleton from '@mui/material/Skeleton';

import { useSnackbar } from "notistack";

import style from './page.module.css';

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
        <Tooltip title="Click to copy">
            <span className={style.copiable} onClick={() => { copy() }}>
                {text}
            </span>
        </Tooltip>
    )
}

export default function AccountPage() {
    const { data: user, isLoading, mutate } = useUser();
    const router = useRouter();
    const [resetDisabled, setResetDisabled] = useState(false);

    useEffect(() => {
        if (user === null) {
            router.push('/account/login');
        }
    }, [router, user]);

    return (
        <Box sx={{ mt: 4 }}>
            <Paper sx={{ m: 1 }}>
                <Box sx={{ p: 1 }}>
                    <Typography variant="h4" sx={{ m: 2 }}>
                        {
                            !isLoading && user ?
                                <Stack direction="row" alignItems="center">
                                    <AccountCircle fontSize="large" />{user.name}
                                </Stack>
                                : <Skeleton />
                        }

                    </Typography>

                </Box>
                <Divider />

                <Box sx={{ p: 2 }}>

                    <Stack direction="column">

                        {!isLoading && user ?
                            <>
                                <div style={{ display: 'flex' }}>
                                    <Tooltip title="User ID">
                                        <TagIcon sx={{ ml: 1, mr: 1 }} />
                                    </Tooltip>
                                    {user.id}
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <Tooltip title="Access Key">
                                        <KeyIcon sx={{ ml: 1, mr: 1 }} />
                                    </Tooltip>
                                    <CopiableText text={user.accessKey} />
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <Tooltip title="Registration Date">
                                        <TodayIcon sx={{ ml: 1, mr: 1 }} />
                                    </Tooltip>
                                    {user.createdAt}
                                </div>
                            </> :
                            <>
                                <Skeleton />
                                <Skeleton />
                                <Skeleton />
                            </>}

                    </Stack>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            onClick={async () => {
                                setResetDisabled(true);
                                await fetch('/api/account/reset-key');
                                await mutate();
                                setResetDisabled(false);
                            }}
                            disabled={resetDisabled}
                        >
                            <AutorenewIcon /> reset access key
                        </Button>
                    </div>
                </Box>
            </Paper>
        </Box>
    );
}
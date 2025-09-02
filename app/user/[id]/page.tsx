'use client';

import { use } from "react";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import AccountCircle from "@mui/icons-material/AccountCircle";
import TagIcon from '@mui/icons-material/Tag';

import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';

import { useUser } from "@/app/context";
import Posts from "@/components/Posts";

export default function UserPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const { data: user, isLoading } = useUser(parseInt(id));

    return (
        <Box className='flex flex-col items-center' sx={{
            
        }}>
            <Paper className='flex flex-col w-3/4 m-4 justify-center'>
                <Box className='justify-start'>
                    <Typography variant="h4" sx={{ m: 2 }}>
                        {(isLoading || !user) && <Skeleton />}
                        {
                            !isLoading && user &&
                            <Stack direction="row" alignItems="center">
                                <AccountCircle fontSize="large" />{user.name}
                            </Stack>
                        }

                    </Typography>
                </Box>

                <Divider flexItem />

                <Box className='p-4'>
                    <Stack direction="column" gap={1}>
                        {(isLoading || !user) && (
                            <>
                                <Skeleton />
                                <Skeleton />
                            </>
                        )}

                        {!isLoading && user && (
                            <>
                                <div className='flex'>
                                    <Tooltip title="User ID">
                                        <TagIcon sx={{ ml: 1, mr: 1 }} />
                                    </Tooltip>
                                    {user.id}
                                </div>
                                <div className='flex'>
                                    Registered at&nbsp;<b>{user.createdAt}</b>
                                </div>
                            </>
                        )}

                    </Stack>
                </Box>
            </Paper>

            <div className='flex flex-1 justify-center mt-2'>
                <Typography variant='h5'>Recent posts</Typography>
            </div>

            <Posts posts={user?.post} layout='grid' count={24} />
        </Box>
    );
}
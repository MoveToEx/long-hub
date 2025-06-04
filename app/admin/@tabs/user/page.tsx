import { prisma } from "@/lib/db";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import _ from "lodash";
import { UserGrid } from "./components";


export default async function UserTab() {
    const users = await prisma.user.findMany({
        orderBy: [
            {
                createdAt: 'desc',
            },
            {
                id: 'asc'
            }
        ]
    });
    return (
        <Box>
            <Box className="flex justify-between">
                <Typography variant='h5'>
                    Users
                </Typography>
            </Box>
            <Box sx={{
                xs: {
                    m: 0,
                },
                md: {
                    m: 2
                }
            }}>
                <UserGrid users={users} />
            </Box>
        </Box>
    );
}
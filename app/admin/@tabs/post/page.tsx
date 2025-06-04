
import { prisma } from "@/lib/db";

import Box from '@mui/material/Box';
import _ from "lodash";
import { PostGrid } from "./components";
import Typography from '@mui/material/Typography';


export default async function PostTab() {
    const posts = await prisma.post.findMany({
        orderBy: [
            {
                createdAt: 'desc'
            }
        ],
        include: {
            uploader: true
        },
    });

    return (
        <Box>
            <Box className="flex justify-between">
                <Typography variant='h5'>
                    Posts
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
                <PostGrid posts={posts} />
            </Box>
        </Box>
    )
}

import { prisma } from '@/lib/db';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

import _ from "lodash";
import { RequestStatus } from "@/lib/schema";
import { RequestDashboard } from "./components";


export default async function DelTab() {
    const [count, deletedPostCount, processedRequestCount] = await prisma.$transaction([
        prisma.deletion_request.count({
            where: {
                status: RequestStatus.pending
            }
        }),
        prisma.post.count({
            where: {
                deletedAt: {
                    not: null
                }
            }
        }),
        prisma.deletion_request.count({
            where: {
                status: {
                    not: RequestStatus.pending
                }
            }
        })
    ]);

    const requests = await prisma.deletion_request.findMany({
        include: {
            user: true,
            post: true
        }
    });

    return (
        <Box>
            <Box className="flex flex-wrap justify-between">
                <Typography variant='h5'>
                    Deletion request
                </Typography>
            </Box>

            <Box className="flex flex-wrap flex-row items-center content-center h-32">
                <Box className="flex flex-1 text-center flex-col items-center">
                    <Typography variant="h4" component="span">
                        {count}
                    </Typography>
                    <Typography variant="button">
                        pending
                    </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box className="flex flex-1 text-center flex-col items-center">
                    <Typography variant="h4" component="span">
                        {deletedPostCount}
                    </Typography>
                    <Typography variant="button">
                        deleted
                    </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box className="flex flex-1 text-center flex-col items-center">
                    <Typography variant="h4" component="span">
                        {processedRequestCount}
                    </Typography>
                    <Typography variant="button">
                        processed
                    </Typography>
                </Box>
            </Box>

            <Box>
                <RequestDashboard requests={requests} />
            </Box>
        </Box>
    )
}
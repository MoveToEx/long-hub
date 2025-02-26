import { prisma } from "@/lib/db";
import Box from '@mui/material/Box';
import { RequestDashboard } from "./components";


export default async function Page() {
    const requests = await prisma.deletion_request.findMany({
        include: {
            user: true,
            post: true
        }
    });

    return (
        <Box sx={{ m: 2 }}>
            <RequestDashboard requests={requests} />
        </Box>
    )
}
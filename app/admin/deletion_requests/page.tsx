import { prisma } from "@/lib/db";
import Box from '@mui/material/Box';
import { RequestDashboard } from "./components";
import { auth } from "@/lib/dal";
import { notFound } from "next/navigation";
import * as C from '@/lib/constants';

export default async function Page() {
    const user = await auth();

    if (!user || (user.permission & C.Permission.Admin.Post.delete) == 0) {
        return notFound();
    }

    const requests = await prisma.deletion_request.findMany({
        include: {
            user: true,
            post: true
        }
    });

    return (
        <Box sx={{
            my: 1,
            mx: {
                xs: 0,
                md: 2
            }
        }}>
            <RequestDashboard requests={requests} />
        </Box>
    )
}
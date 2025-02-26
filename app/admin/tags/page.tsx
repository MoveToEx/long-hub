import { prisma } from "@/lib/db";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Link from "next/link";

import { MigratePostsInput, TagsGrid } from './components';
import { auth } from '@/lib/dal';
import { notFound } from "next/navigation";

import * as C from '@/lib/constants';

export const dynamic = 'force-dynamic';

export default async function TagsAdminPage() {
    const user = await auth();

    if (!user || (user.permission & C.Permission.Admin.Post.edit) == 0) {
        return notFound();
    }

    const tags = await prisma.tag.findMany({
        include: {
            _count: {
                select: {
                    posts: {
                        where: {
                            deletedAt: null
                        }
                    }
                }
            }
        }
    });


    return (
        <Box sx={{ m: 2 }}>
            <Button variant="text" LinkComponent={Link} href="/admin">
                ≪ BACK
            </Button>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <div style={{ height: 750 }}>
                        <TagsGrid tags={tags} />
                    </div>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2 }}>
                        <MigratePostsInput tags={tags.map(tag => tag.name!)} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
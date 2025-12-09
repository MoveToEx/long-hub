import { prisma } from '@/lib/db';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { TagsGrid, MigratePostsInput } from "./components";

export default async function TagTab() {
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
        },
        orderBy: [
            {
                posts: {
                    _count: 'desc'
                }
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
                    Tags
                </Typography>
            </Box>
            <Grid
                container
                spacing={2}
                sx={{
                    md: {
                        m: 2
                    },
                    xs: {
                        m: 0
                    }
                }}>
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
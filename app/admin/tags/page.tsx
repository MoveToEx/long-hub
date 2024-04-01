import { prisma } from "@/lib/db";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Link from "next/link";

import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { MigratePostsInput } from './components';
import { EditTag } from "./actions";

export const dynamic = 'force-dynamic'

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    {
        field: 'name',
        headerName: 'Name',
        width: 300,
        type: 'string',
        editable: true,
    },
    {
        field: '_count',
        headerName: 'Posts',
        width: 150,
        editable: false
    }
];

export default async function TagsAdminPage() {
    const tags = await prisma.tag.findMany({
        include: {
            _count: {
                select: {
                    posts: true
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
                <Grid xs={12} md={8}>
                    <div style={{height: 750}}>
                        <DataGrid
                            columns={columns}
                            rows={tags.map(tag => ({
                                ...tag,
                                _count: tag._count.posts,
                            }))}
                            processRowUpdate={EditTag}
                            pageSizeOptions={[30, 50, 100]}
                        />
                    </div>
                </Grid>
                <Grid xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>

                        <MigratePostsInput tags={tags.map(tag => tag.name!)} />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
'use client';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import SendIcon from '@mui/icons-material/Send';
import Button from '@mui/material/Button';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { EditTag, MigratePosts } from './actions';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';

const columns: GridColDef[] = [
    {
        field: 'id',
        headerName: 'ID',
        align: 'center',
        headerAlign: 'left',
        width: 100
    },
    {
        field: 'name',
        headerName: 'Name',
        width: 300,
        align: 'center',
        headerAlign: 'left',
        type: 'string',
        editable: true,
    },
    {
        field: '_count',
        headerName: 'Posts',
        width: 150,
        align: 'center',
        headerAlign: 'left',
        type: 'number',
        editable: false
    }
];

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Grid container sx={{ justifyContent: 'flex-end' }}>
            <Grid>
                <Button
                    disabled={pending}
                    variant='contained'
                    startIcon={<SendIcon />}
                    type='submit' >
                    Submit
                </Button>
            </Grid>
        </Grid>
    )
}

export function MigratePostsInput({
    tags
}: {
    tags: string[]
}) {
    const [state, action] = useActionState(MigratePosts, '');
    return (
        <Box sx={{ m: 1 }} component="form" action={action}>
            <Typography variant="h5" sx={{ m: 2 }}>
                Migrate posts
            </Typography>
            <Autocomplete
                renderInput={(params) => <TextField {...params} label="From" name="from" required />}
                options={tags}
            />
            <Stack alignItems="center">
                <ArrowDropDownIcon fontSize="large" />
            </Stack>
            <Autocomplete
                freeSolo
                renderInput={(params) => <TextField {...params} label="To" name="to" required />}
                options={tags}
            />
            <FormControlLabel control={<Checkbox name="delete-source" />} label="Delete empty source tag" />
            <Typography color="error">
                {state}
            </Typography>
            <SubmitButton />
        </Box>
    )
}

export function TagsGrid({ tags }: {
    tags: {
        _count: {
            posts: number
        },
        id: number,
        name: string | null,
    }[]
}) {
    return (
        <DataGrid
            columns={columns}
            rows={tags.map(tag => ({
                ...tag,
                _count: tag._count.posts,
            }))}
            processRowUpdate={EditTag}
            pageSizeOptions={[30, 50, 100]}
            showToolbar
        />
    )
}
'use client';

import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import SendIcon from '@mui/icons-material/Send';
import Button from '@mui/material/Button';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useFormState, useFormStatus } from 'react-dom';
import { MigratePosts } from './actions';

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
    const [state, action] = useFormState(MigratePosts, '');
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
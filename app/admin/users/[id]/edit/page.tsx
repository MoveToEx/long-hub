import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { notFound } from "next/navigation";

import { User } from "@/lib/db";
import { PermissionDescription } from '@/lib/constants';
import { BitBoard } from './components';
import _ from 'lodash';
import { EditUser } from './actions';
import Link from 'next/link';

export default async function EditUserPage({
    params
}: {
    params: {
        id: string
    }
}) {
    const user = await User.findByPk(Number(params.id));

    if (!user) {
        return notFound();
    }

    return (
        <Box sx={{ m: 2 }}>

            <Typography variant="h5">
                Editing user #{user.id} {user.name}
            </Typography>
            <Box sx={{ p: 2, m: 2 }} component="form" action={EditUser}>
                <Box sx={{ mt: 2, mb: 4 }}>
                    <input type="hidden" name="id" value={user.id} />
                    <Stack direction="column" spacing={2}>
                        <TextField label="Username" name="username" defaultValue={user.name} fullWidth />
                        <TextField label="New password" name="password" type="password" fullWidth />
                        <BitBoard
                            label="Permissions"
                            bitCount={16}
                            value={
                                _.range(16).map(val => ((user.permission & (1 << val)) == 0 ? 0 : 1))
                            }
                            description={
                                _.range(16).map(val => _.get(PermissionDescription, val, ''))
                            }
                        />
                    </Stack>

                </Box>
                <Stack direction="row" alignSelf="center" justifyContent="center" spacing={2}>
                    <Button variant="contained" type="submit" startIcon={<CheckIcon />}>
                        Submit
                    </Button>

                    <Button startIcon={<CloseIcon />} LinkComponent={Link} href="/admin/users/">
                        Cancel
                    </Button>
                </Stack>
            </Box>


        </Box>
    )
}
'use client';

import { prisma } from '@/lib/db';
import { DataGrid, GridColDef, GridToolbar, GridActionsCellItem, useGridApiContext } from '@mui/x-data-grid';
import { Prisma } from '@/lib/schema';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useCallback, useMemo, useState } from 'react';
import { enqueueSnackbar, useSnackbar } from 'notistack';
import { DeleteUser, EditUser, ResetAccessKey } from './actions';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Typography from '@mui/material/Typography';

type User = NonNullable<Prisma.Result<typeof prisma.user, {}, 'findFirst'>>;

const columns: GridColDef[] = [
    {
        field: 'id',
        headerName: 'ID',
        align: 'center',
        headerAlign: 'left',
        width: 100,
        type: 'number'
    },
    {
        field: 'name',
        headerName: 'Username',
        align: 'center',
        headerAlign: 'left',
        width: 200,
        editable: true
    },
    {
        field: 'passwordHash',
        headerName: 'Password hash',
        align: 'center',
        headerAlign: 'left',
        width: 200,
        valueFormatter: (val: string) => val.slice(0, 5) + '...' + val.slice(-5)
    },
    {
        field: 'accessKey',
        headerName: 'Access key',
        align: 'center',
        headerAlign: 'left',
        width: 200,
        valueFormatter: (val: string) => val.slice(0, 5) + '...' + val.slice(-5)
    },
    {
        field: 'permission',
        headerName: 'Permission',
        align: 'center',
        headerAlign: 'left',
        width: 200,
        type: 'number',
        valueFormatter: (val: number) => val.toString(16),
        editable: true
    },
    {
        field: 'actions',
        type: 'actions',
        headerName: 'Action',
        getActions: (params) => [
            <ResetAction id={params.row.id} key='reset' />,
            <DeleteAction id={params.row.id} key='del' />
        ]
    }
];

function ResetAction({
    id
}: {
    id: number
}) {
    const ctx = useGridApiContext();
    return (
        <GridActionsCellItem
            label='Reset access key'
            icon={<AutorenewIcon />}
            onClick={async () => {
                ctx.current.setLoading(true);
                try {
                    await ResetAccessKey(id);
                }
                catch (e) {
                    ctx.current.setLoading(false);
                    enqueueSnackbar(String(e), { variant: 'error' });
                }
            }}
        />
    )
}


function DeleteAction({
    id
}: {
    id: number
}) {
    const [open, setOpen] = useState(false);
    const ctx = useGridApiContext();

    return (
        <>
            <GridActionsCellItem
                label="Delete"
                icon={<DeleteIcon />}
                onClick={() => setOpen(true)} />
            <Dialog
                open={open}
                maxWidth="lg"
                onClose={() => setOpen(false)}>
                <DialogTitle id="alert-dialog-title">Confirm deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete user with id = {id}?</Typography>
                    <Typography sx={{ fontWeight: 600 }}>This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={async () => {
                            setOpen(false);
                            ctx.current.setLoading(true);
                            try {
                                await DeleteUser(id);
                            }
                            catch (e) {
                                ctx.current.setLoading(false);
                                enqueueSnackbar(String(e), { variant: 'error' });
                            }
                        }}
                        color="error"
                        autoFocus>
                        confirm
                    </Button>
                    <Button
                        onClick={() => setOpen(false)}
                        autoFocus>
                        cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export function UserGrid({ users }: {
    users: User[]
}) {
    const { enqueueSnackbar } = useSnackbar();

    const onError = useCallback((err: Error) => {
        enqueueSnackbar('Failed: ' + err.message, { variant: 'error' });
    }, [enqueueSnackbar]);

    const initialState = useMemo(() => ({
        pagination: {
            paginationModel: {
                page: 0,
                pageSize: 20
            }
        }
    }), []);

    const slots = useMemo(() => ({ toolbar: GridToolbar }), []);
    const slotProps = useMemo(() => ({
        toolbar: {
            showQuickFilter: true,
        },
    }), []);


    return (
        <DataGrid
            sx={{
                height: '700px'
            }}
            pageSizeOptions={[10, 20, 50, 100]}
            columns={columns}
            rows={users}
            processRowUpdate={EditUser}
            onProcessRowUpdateError={onError}
            initialState={initialState}
            slots={slots}
            slotProps={slotProps}
        />
    )
}


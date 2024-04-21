'use client';

import { prisma } from '@/lib/db';
import { DataGrid, GridColDef, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import { Prisma } from '@prisma/client';
import { EditPost, DeletePost } from './actions';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import { useSnackbar } from 'notistack';
import { useState } from 'react';

type Post = Prisma.Result<typeof prisma.post, {
    select: {
        id: true,
        image: true,
        imageURL: true,
        text: true,
        aggr: true,
        createdAt: true,
        imageHash: true,
        uploaderId: true
    }
}, 'findMany'>;


export function PostGrid({ posts }: {
    posts: Post
}) {
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        id: '',
        image: ''
    });
    const { enqueueSnackbar } = useSnackbar();
    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            align: 'center',
            headerAlign: 'left',
            width: 300
        },
        {
            field: 'imageURL',
            headerName: 'Image',
            align: 'center',
            width: 100,
            filterable: false,
            sortable: false,
            renderCell: (params) => {
                if (params.value == null) return <></>;
                return (
                    <Image
                        src={params.value}
                        alt={params.id.toString()}
                        height={64}
                        width={64}
                        quality={25}
                        style={{
                            objectFit: 'contain',
                            maxHeight: '100%'
                        }}
                    />
                );
            }
        },
        {
            field: 'text',
            headerName: 'Text',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            type: 'string',
            editable: true,
        },
        {
            field: 'aggr',
            headerName: 'Aggr.',
            width: 70,
            align: 'center',
            headerAlign: 'left',
            type: 'number',
            editable: true
        },
        {
            field: 'createdAt',
            headerName: 'Created',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            type: 'dateTime',
        },
        {
            field: 'imageHash',
            headerName: 'Image Hash',
            width: 200,
            align: 'center',
            headerAlign: 'center',
            type: 'string',
            valueFormatter: (val) => parseInt(val, 2).toString(16).toUpperCase()
        },
        {
            field: 'uploaderId',
            headerName: 'Uploader',
            width: 100,
            align: 'center',
            headerAlign: 'center',
            type: 'number',
            editable: true
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            headerAlign: 'center',
            getActions: (params) => [
                <GridActionsCellItem
                    key="delete"
                    label="Delete"
                    icon={<DeleteIcon />}
                    onClick={() => setDeleteDialog({
                        open: true,
                        id: params.row.id,
                        image: params.row.imageURL
                    })} />
            ]
        }
    ];

    const editAction = (updatedRow: any, originalRow: any) => {
        return EditPost(updatedRow, originalRow)
            .then(({ ok, message }) => {
                if (ok) {
                    return updatedRow;
                }
                else {
                    enqueueSnackbar('Failed: ' + message, { variant: 'error' });
                    return originalRow;
                }
            });
    }

    return (
        <>
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({
                    ...deleteDialog,
                    open: false
                })}
            >
                <DialogTitle id="alert-dialog-title">Delete post {deleteDialog.id}?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This action cannot be undone.
                    </DialogContentText>
                    {deleteDialog.image &&
                        <Image
                            src={deleteDialog.image}
                            alt="image"
                            height={300}
                            width={300}
                            style={{
                                objectFit: 'contain',
                                maxHeight: '300px',
                                width: '100%',
                            }} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({
                        ...deleteDialog,
                        open: false
                    })}>Cancel</Button>
                    <Button
                        onClick={() => {
                            setDeleteDialog({
                                ...deleteDialog,
                                open: false,
                            });
                            DeletePost(deleteDialog.id)
                                .then(({ ok, message }) => {
                                    if (ok) {
                                        enqueueSnackbar('Deleted ' + deleteDialog.id, { variant: 'success' });
                                    }
                                    else {
                                        enqueueSnackbar('Failed: ' + message, { variant: 'error' });
                                    }
                                });
                        }}
                        color="warning"
                        autoFocus
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <DataGrid
                sx={{
                    height: '700px'
                }}
                pageSizeOptions={[10, 20, 50]}
                columns={columns}
                rows={posts}
                processRowUpdate={editAction}
                initialState={{
                    pagination: {
                        paginationModel: {
                            page: 0,
                            pageSize: 20
                        }
                    },
                    columns: {
                        columnVisibilityModel: {
                            imageHash: false,
                        }
                    },
                    density: 'comfortable'
                }}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                    },
                }}
            />
        </>
    )
}

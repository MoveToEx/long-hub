'use client';

import { prisma } from '@/lib/db';
import { DataGrid, GridColDef, GridActionsCellItem, useGridApiContext, getGridDateOperators, getGridStringOperators, GridInitialState } from '@mui/x-data-grid';
import { Prisma, Rating, Status } from '@prisma/client';
import { EditPost, DeletePost, RecoverPost, getRows } from './actions';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import UndoIcon from '@mui/icons-material/Undo';


import { useSnackbar } from 'notistack';
import { useCallback, useMemo, useState } from 'react';
import { getDateFilterOperator, getNumberFilterOperator, getSelectFilterOperator, getStringFilterOperator } from '@/lib/grid';

type Post = NonNullable<Prisma.Result<typeof prisma.post, {
    include: {
        uploader: {
            select: {
                id: true,
                name: true
            }
        }
    }
}, 'findFirst'>>;

const columns: GridColDef[] = [
    {
        field: 'id',
        headerName: 'ID',
        align: 'center',
        headerAlign: 'left',
        width: 300,
        type: 'string',
        filterOperators: getStringFilterOperator(false)
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
                    unoptimized
                    crossOrigin='anonymous'
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
        filterOperators: getStringFilterOperator(false),
        editable: true,
    },
    {
        field: 'rating',
        headerName: 'Rating',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        type: 'singleSelect',
        filterOperators: getSelectFilterOperator(false, Object.values(Rating)),
        valueOptions: Object.values(Rating),
        editable: true
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        type: 'singleSelect',
        filterOperators: getSelectFilterOperator(false, Object.values(Status)),
        valueOptions: Object.values(Status),
        editable: true
    },
    {
        field: 'createdAt',
        headerName: 'Created At',
        width: 150,
        align: 'center',
        headerAlign: 'center',
        filterOperators: getDateFilterOperator(false),
        type: 'dateTime',
    },
    {
        field: 'updatedAt',
        headerName: 'Updated At',
        width: 150,
        align: 'center',
        headerAlign: 'center',
        filterOperators: getDateFilterOperator(false),
        type: 'dateTime',
    },
    {
        field: 'imageHash',
        headerName: 'Image Hash',
        width: 200,
        align: 'center',
        headerAlign: 'center',
        type: 'string',
        filterOperators: getStringFilterOperator(true),
        valueFormatter: (val) => parseInt(val, 2).toString(16).toUpperCase()
    },
    {
        field: 'deletedAt',
        headerName: 'Deleted At',
        width: 200,
        align: 'center',
        headerAlign: 'center',
        type: 'dateTime',
        filterOperators: getDateFilterOperator(true),
        editable: true,
    },
    {
        field: 'deletionReason',
        headerName: 'Deleted Reason',
        width: 200,
        align: 'center',
        headerAlign: 'center',
        type: 'string',
        filterOperators: getStringFilterOperator(true),
        editable: true,
    },
    {
        field: 'uploaderId',
        headerName: 'Uploader',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        type: 'number',
        filterOperators: getNumberFilterOperator(true),
        editable: true,
        renderCell: (params) => {
            if (params.row.uploader !== null) {
                return <span>{params.value} ({params.row.uploader.name})</span>;
            }
            return <span>(NULL)</span>;
        }
    },
    {
        field: 'actions',
        type: 'actions',
        headerName: 'Action',
        getActions: (params) => RowAction(params.row)
    }
];

function DeleteAction({
    id,
    src
}: {
    id: string,
    src: string
}) {
    const [open, setOpen] = useState(false);
    const ctx = useGridApiContext();
    const [reason, setReason] = useState('');

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
                    <Image
                        src={src}
                        alt="image"
                        unoptimized
                        crossOrigin='anonymous'
                        height={300}
                        width={300}
                        style={{
                            objectFit: 'contain',
                            maxHeight: '300px',
                            width: '100%',
                        }} />
                    <TextField
                        sx={{
                            mt: 2
                        }}
                        fullWidth
                        multiline
                        rows={3}
                        value={reason}
                        onChange={(event) => {
                            setReason(event.currentTarget.value);
                        }}
                        label="Additional details" />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={async () => {
                            setOpen(false);
                            ctx.current.setLoading(true);
                            await DeletePost(id, reason);
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

function RevokeAction({ id }: {
    id: string
}) {
    const ctx = useGridApiContext();

    return (
        <GridActionsCellItem
            label="Revoke deletion"
            icon={<UndoIcon />}
            onClick={async () => {
                ctx.current.setLoading(true);
                await RecoverPost(id);
            }} />
    )
}

function RowAction(post: Post) {
    const result = [];

    if (post.deletedAt === null) {
        result.push(<DeleteAction id={post.id} src={post.imageURL} key="delete" />);
    }
    else {
        result.push(<RevokeAction id={post.id} key="revoke" />)
    }
    return result;
}

export function PostGrid() {
    const { enqueueSnackbar } = useSnackbar();

    const onError = useCallback((err: Error) => {
        enqueueSnackbar('Failed: ' + err.message, { variant: 'error' });
    }, [enqueueSnackbar]);

    const initialState: GridInitialState = useMemo(() => ({
        pagination: {
            paginationModel: {
                page: 0,
                pageSize: 20
            }
        },
        columns: {
            columnVisibilityModel: {
                imageHash: false,
                uploaderId: false,
                deletedAt: false,
                deletionReason: false,
                updatedAt: false,
            }
        },
        filter: {
            filterModel: {
                items: [
                    {
                        field: 'deletedAt',
                        operator: '$null'
                    }
                ]
            }
        },
        sorting: {
            sortModel: [
                {
                    field: 'createdAt',
                    sort: 'desc'
                }
            ]
        }
    }), []);

    const dataSource = useMemo(() => ({
        getRows
    }), []);


    return (
        <DataGrid
            sx={{
                height: '700px'
            }}
            pageSizeOptions={[10, 20, 50, 100]}
            columns={columns}
            dataSource={dataSource}
            processRowUpdate={EditPost}
            onProcessRowUpdateError={onError}
            onDataSourceError={onError}
            initialState={initialState}
            showToolbar
        />
    )
}

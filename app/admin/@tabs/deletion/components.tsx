'use client';

import { Prisma, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import Grid from '@mui/material/Grid';
import { ReactElement, useMemo, useState } from "react";
import Image from "next/image";
import { DataGrid, GridActionsCellItem, GridColDef, GridToolbar, useGridApiContext } from "@mui/x-data-grid";
import Link from "next/link";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ApproveRequest, RevokeRequest, DismissRequest } from "./actions";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { usePost } from "@/app/context";
import CircularProgress from "@mui/material/CircularProgress";
import Box from '@mui/material/Box';

type DeletionRequest = NonNullable<Prisma.Result<typeof prisma.deletion_request, {
    include: {
        post: true,
        user: true
    }
}, 'findFirst'>>;

const columns: GridColDef<DeletionRequest>[] = [
    {
        field: 'id',
        type: 'number',
        headerName: 'ID',
        align: 'center',
        headerAlign: 'center',
        width: 100,
    },
    {
        field: 'postId',
        headerName: 'Post ID',
        width: 300,
        align: 'center',
        headerAlign: 'center',
        type: 'string',
        renderCell(params) {
            if (params.value === null) return <></>;

            return (
                <Link href={'/post/' + params.value} target="_blank">
                    {params.value}
                </Link>
            )
        },
    },
    {
        field: 'image',
        headerName: 'Image',
        align: 'center',
        width: 100,
        filterable: false,
        sortable: false,
        valueGetter: (value, row) => {
            return row.post.imageURL;
        },
        renderCell: (params) => {
            if (params.value == null) return <></>;
            return (
                <Image
                    src={params.value}
                    alt={params.row.id.toString()}
                    unoptimized
                    crossOrigin='anonymous'
                    height={64}
                    width={64}
                    quality={25}
                    className='max-h-full object-contain'
                />
            );
        }
    },
    {
        field: 'reason',
        headerName: 'Reason',
        align: 'left',
        width: 150,
    },
    {
        field: 'createdAt',
        headerName: 'Created at',
        align: 'left',
        type: 'dateTime',
        width: 150,
    },
    {
        field: 'status',
        headerName: 'Status',
        type: 'singleSelect',
        valueOptions: Object.values(RequestStatus),
        width: 100,
    },
    {
        field: 'actions',
        headerName: 'Action',
        type: 'actions',
        width: 150,
        getActions: (params) => {
            return GetRequestActions(params.row);
        }
    }
];

function DuplicateDialog({
    src,
    srcId,
    dupId
}: {
    src: string,
    srcId: string,
    dupId: string
}) {
    const { data, isLoading, error } = usePost(dupId);
    const [open, setOpen] = useState(false);

    return (
        <>
            <GridActionsCellItem
                label="View difference"
                icon={<VisibilityIcon />}
                onClick={() => setOpen(true)} />
            <Dialog
                open={open}
                maxWidth="md"
                onClose={() => setOpen(false)}>
                <DialogTitle id="alert-dialog-title">Compare</DialogTitle>
                <DialogContent>
                    <Grid container>
                        <Grid size={12} sx={{ lineBreak: 'auto' }}>
                            Comparing {srcId} against {dupId}
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
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
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            {!data &&
                                <Box className="flex flex-col items-center justify-center h-full">
                                    {isLoading && <CircularProgress />}
                                    {error && <>Error occurred while loading post: {error.toString()}</>}
                                </Box>
                            }
                            {data &&
                                <Image
                                    src={data.imageURL}
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
                            }
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpen(false)}
                        color="warning"
                        autoFocus>
                        CLOSE
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

function GetRequestActions(req: DeletionRequest) {
    const grid = useGridApiContext();

    const wrapper = async (promise: Promise<any>) => {
        grid.current.setLoading(true);
        await promise;
    }

    const actions: ReactElement[] = [];

    if (req.status === RequestStatus.pending || req.status === RequestStatus.dismissed || req.status === RequestStatus.revoked) {
        actions.push(
            <GridActionsCellItem
                label="Approve"
                icon={<CheckIcon />}
                onClick={() => wrapper(ApproveRequest(req.id))}
            />
        );
        if (req.status !== RequestStatus.dismissed) {
            actions.push(
                <GridActionsCellItem
                    label="Dismiss"
                    icon={<CloseIcon />}
                    onClick={() => wrapper(DismissRequest(req.id))}
                />
            );
        }
    }
    else if (req.status === RequestStatus.approved) {
        actions.push(
            <GridActionsCellItem
                label="Revoke"
                icon={<UndoIcon />}
                onClick={() => wrapper(RevokeRequest(req.id))}
            />
        )
    }

    if (req.reason.startsWith('duplicate')) {
        const match = req.reason.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);

        if (match !== null) {
            const [id, _] = match;
            actions.push(
                <DuplicateDialog src={req.post.imageURL} dupId={id} srcId={req.postId} />
            )
        }
    }
    return actions;
}

export function RequestDashboard({
    requests
}: {
    requests: DeletionRequest[]
}) {
    const initialState = useMemo(() => ({
        pagination: {
            paginationModel: {
                page: 0,
                pageSize: 20
            }
        },
        columns: {
            columnVisibilityModel: {
                createdAt: false
            }
        },
        filter: {
            filterModel: {
                items: [
                    {
                        field: 'status',
                        operator: 'is',
                        value: RequestStatus.pending
                    }
                ]
            }
        }
    }), []);

    const pageSizeOptions = useMemo(() => [10, 20, 50, 100], []);

    return (
        <Grid container>
            <Grid size={12} height={512}>
                <DataGrid
                    rows={requests}
                    columns={columns}
                    pageSizeOptions={pageSizeOptions}
                    initialState={initialState}
                    showToolbar
                />
            </Grid>
        </Grid>
    )
}
'use client';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Alert from '@mui/material/Alert';

import { useCallback, useState } from 'react';
import { useSnackbar } from 'notistack';
import _ from 'lodash';
import Image from 'next/image';
import RequiresLogin from '@/components/RequiresLogin';

import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import LinearProgress from '@mui/material/LinearProgress';
import { SearchButton } from './components';
import { useCompositeState, useUploadState } from '@/lib/hooks';

import DragDrop from '@/components/DragDrop';
import { Rating } from '@/lib/schema';
import MetadataForm from '@/components/edit/MetadataForm';

type Metadata = {
    text: string,
    rating: Rating,
    tags: string[]
}

type Preview = {
    blob: Blob,
    url: string
};

export default function UploadPage() {
    const { state, id, progress, error, submit } = useUploadState();

    const [files, setFiles] = useState<Preview[]>([]);
    const { state: metadata, setSingle: set, reset } = useCompositeState<Metadata>({
        text: '',
        rating: Rating.none,
        tags: []
    });

    const { enqueueSnackbar } = useSnackbar();

    const next = useCallback(() => {
        if (files.length == 0) return;

        reset();

        URL.revokeObjectURL(files[0].url);
        setFiles(files => _.slice(files, 1));
    }, [files, reset]);

    return (
        <Grid container spacing={2} sx={{ m: 2 }}>
            <RequiresLogin />
            <Grid sx={{ overflow: 'hidden' }} size={{ xs: 12, md: 6 }}>
                <div className="h-12 w-full flex flex-col gap-1 justify-center items-center text-center">
                    {state !== 'idle' && (
                        <>
                            <div className="h-6 w-full">
                                {id !== null && (
                                    <Fade in>
                                        <Typography>{id}</Typography>
                                    </Fade>
                                )}
                            </div>
                            {progress !== null && state === 'uploading' &&
                                <LinearProgress className="w-full" value={progress} variant='determinate' />
                            }
                            {(progress === null || state !== 'uploading') &&
                                <LinearProgress className="w-full" variant="indeterminate" />
                            }
                        </>
                    )}
                </div>
                {files.length == 0 &&
                    <DragDrop
                        accept="image/*"
                        multiple
                        onChange={files => {
                            setFiles(files.map(blob => ({
                                blob,
                                url: URL.createObjectURL(blob)
                            })));
                        }} />
                }
                {!_.isEmpty(files) && (
                    <Image
                        alt="Preview"
                        className="w-full h-auto max-h-96 object-contain"
                        src={files[0].url}
                        height={300}
                        width={300} />
                )}
            </Grid>
            <Grid className='flex flex-col gap-3' size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" className='self-center'>
                    {`${files.length} image${files.length > 1 ? 's' : ''} left`}
                </Typography>
                <MetadataForm value={metadata} reducer={(key, val) => set(key, val)} />

                <Typography variant="subtitle2">
                    File type: {files.length == 0 ? 'None' : files[0].blob.type}
                </Typography>

                {error && (
                    <Alert severity='error'>{error?.message}</Alert>
                )}

                <div className='flex flex-row justify-around'>
                    <Button
                        onClick={() => {
                            next();
                            enqueueSnackbar('Skipped 1 image', { variant: 'info' });
                        }}
                        color="error"
                        startIcon={<DeleteIcon />}
                        disabled={state !== 'idle' || files.length == 0}>
                        skip
                    </Button>

                    <Button
                        variant='contained'
                        onClick={async () => {
                            if (await submit(metadata, files[0].blob)) {
                                enqueueSnackbar('Uploaded successfully', {
                                    variant: 'success'
                                });
                                next();
                            }
                        }}
                        color="primary"
                        startIcon={<SendIcon />}
                        disabled={files.length == 0}
                        loading={state !== 'idle'}>
                        submit
                    </Button>

                    <SearchButton
                        text={metadata.text}
                        tags={metadata.tags}
                        disabled={files.length === 0} />
                </div>
            </Grid>
        </Grid>
    );
}
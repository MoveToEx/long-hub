'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';

import { useCallback, useState } from 'react';
import { useSnackbar } from 'notistack';
import _ from 'lodash';
import Image from 'next/image';
import RequiresLogin from '@/components/RequiresLogin';

import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import LinearProgress from '@mui/material/LinearProgress';
import { SearchButton } from './components';
import { useCompositeState } from '@/lib/hooks';

import RatingComponent from '@/components/Rating';
import RatingIcon from '@/components/RatingIcon';
import DragDrop from '@/components/DragDrop';
import { Rating } from '@prisma/client';
import { TagsInput } from '@/components/TagsInput';

type Metadata = {
    text: string,
    rating: Rating,
    tags: string[]
}

type Preview = {
    blob: Blob,
    url: string
};

type State = 'idle' | 'wait-sign' | 'uploading' | 'wait-ack';

export default function UploadPage() {
    const [state, setState] = useState<State>('idle');
    const [id, setId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<Preview[]>([]);
    const { state: metadata, setSingle, reset } = useCompositeState<Metadata>({
        text: '',
        rating: Rating.none,
        tags: []
    });
    const [progress, setProgress] = useState<number | null>(null);

    const { enqueueSnackbar } = useSnackbar();

    const next = useCallback(() => {
        if (files.length == 0) return;

        reset();

        URL.revokeObjectURL(files[0].url);
        setFiles(files => _.slice(files, 1));
    }, [files, reset]);

    const submit = useCallback(async (metadata: Metadata, blob: Blob) => {
        setState('wait-sign');

        let response = await fetch('/api/post/upload/sign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mime: blob.type
            }),
        });

        if (!response.ok) {
            setState('idle');
            enqueueSnackbar('Failed when acquiring presigned url', {
                variant: 'error'
            });
            return;
        }

        const { url, id } = await response.json();

        setId(id);
        setState('uploading');

        let status: number = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    setProgress((100 * event.loaded) / event.total);
                }
            };
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    resolve(xhr.status);
                }
            };

            xhr.onerror = () => {
                reject(xhr.status);
            };
            xhr.open('PUT', url, true);
            xhr.setRequestHeader('Content-Type', blob.type);
            xhr.send(blob);
        });

        if (!(status >= 200 && status < 300)) {
            setState('idle');
            enqueueSnackbar('Failed when uploading', {
                variant: 'error'
            });
            return;
        }

        setState('wait-ack');

        response = await fetch('/api/post/upload/ack', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id,
                metadata
            }),
        });

        if (!response.ok) {
            setState('idle');
            enqueueSnackbar('Failed: ' + response.statusText, {
                variant: 'error'
            });
            return;
        }

        setState('idle');
        setId(null);
        setProgress(null);
        next();
        enqueueSnackbar('Uploaded successfully', {
            variant: 'success'
        });
    }, [enqueueSnackbar, next]);

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
            <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2} alignItems="center">
                    <Typography variant="h6">
                        {files.length.toString() + ' image' + (files.length > 1 ? 's' : '') + ' left'}
                    </Typography>
                    <TextField
                        label="Text"
                        fullWidth
                        value={metadata.text}
                        type="text"
                        autoComplete="off"
                        name="text"
                        onChange={(e) => {
                            setSingle('text', e.target.value);
                        }}
                    />
                    <TagsInput
                        value={metadata.tags}
                        onChange={v => setSingle('tags', v)} />
                    <Box className="flex w-full items-center">
                        <Tooltip title="Rating">
                            <RatingIcon />
                        </Tooltip>
                        <RatingComponent
                            value={metadata.rating}
                            onChange={(_, newValue) => {
                                setSingle('rating', newValue);
                            }} />
                        <Box sx={{ ml: 1 }}>
                            {_.upperFirst(metadata.rating)}
                        </Box>
                    </Box>

                    <Box className="w-full">
                        <Typography variant="subtitle2">
                            File type: {files.length == 0 ? 'None' : files[0].blob.type}
                        </Typography>
                    </Box>

                    <Box sx={{ p: 1, position: 'relative' }} >

                        <Stack direction="row" spacing={2}>

                            <Tooltip title="Submit">
                                <span>
                                    <Fab onClick={async () => {
                                        setLoading(true);
                                        await submit(metadata, files[0].blob);
                                        setLoading(false);
                                    }} color="primary" disabled={loading || files.length == 0}>
                                        <SendIcon />
                                    </Fab>
                                </span>
                            </Tooltip>

                            <Tooltip title="Skip current image">
                                <span>
                                    <Fab onClick={() => {
                                        next();
                                        enqueueSnackbar('Skipped 1 image', { variant: 'info' });
                                    }} color="error" disabled={loading || files.length == 0}>
                                        <DeleteIcon />
                                    </Fab>
                                </span>
                            </Tooltip>

                            <SearchButton text={metadata.text} tags={metadata.tags} />
                        </Stack>
                    </Box>
                </Stack>
            </Grid>
        </Grid>
    );
}
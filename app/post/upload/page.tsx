'use client';

import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Tooltip from '@mui/material/Tooltip';
import PostGrid from '@/components/PostGridItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import { ReactNode, useCallback, useState } from 'react';
import { useSnackbar } from 'notistack';
import _ from 'lodash';
import Image from 'next/image';
import RequiresLogin from '@/components/RequiresLogin';

import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

import { useSearchResult, SearchQuery } from '@/app/context';
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

type DialogInfo = {
    open: boolean;
    title?: string;
    subtitle?: string;
    content?: ReactNode;
};

function SearchButton({
    text,
    tags
}: {
    text: string,
    tags: string[]
}) {
    const transform = useCallback((text: string, tags: string[]) => {
        const filter = [];
        if (text) {
            filter.push({
                type: 'text',
                op: 'contains',
                value: text
            });
        }
        tags.forEach(tag => {
            filter.push({
                type: 'tag',
                op: 'include',
                value: tag
            });
        });
        return { filter }
    }, []);
    const { enqueueSnackbar } = useSnackbar();
    const [query, setQuery] = useState<SearchQuery | null>(null);
    const [open, setOpen] = useState(false);
    const { data, error, isLoading } = useSearchResult(query);

    if (error) {
        enqueueSnackbar('Failed: ' + error, { variant: 'error' });
    }

    return (
        <>
            <Tooltip title="Search with current conditions">
                <Fab onClick={() => {
                    setQuery(transform(text, tags));
                    setOpen(true);
                }} color="secondary" disabled={isLoading}>
                    <SearchIcon />
                </Fab>
            </Tooltip>
            <Dialog onClose={() => setOpen(false)} open={open && !isLoading && data !== undefined} maxWidth="md" fullWidth>
                <DialogTitle>Search Result</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {`${data?.count} result(s) in total`}
                    </DialogContentText>
                    <Box sx={{ m: 2 }}>
                        <Grid container>
                            {
                                data?.data.map(post => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                                        <PostGrid value={post} newTab />
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<Preview[]>([]);
    const { state: metadata, setSingle, reset } = useCompositeState<Metadata>({
        text: '',
        rating: Rating.none,
        tags: []
    });
    const [dialog, setDialog] = useState<DialogInfo>({
        open: false
    });
    const [ignoreSimilar, setIgnoreSimilar] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const next = useCallback(() => {
        if (files.length == 0) return;

        reset();

        setIgnoreSimilar(false);
        URL.revokeObjectURL(files[0].url);
        setFiles(files => _.slice(files, 1));
    }, [files, reset]);

    const submit = useCallback(async (metadata: Metadata, force: boolean, blob: Blob) => {
        const fd = new FormData();
        fd.append('force', force ? '1' : '0');
        fd.append('image', blob);
        fd.append('metadata', JSON.stringify(metadata));

        setLoading(true);

        const response = await fetch('/api/post', {
            method: 'POST',
            body: fd,
        });

        setLoading(false);

        if (response.ok) {
            next();
            enqueueSnackbar('Uploaded successfully', {
                variant: 'success'
            });
            return;
        }

        if (response.status == 409) {
            const data = await response.json();
            setDialog({
                open: true,
                title: 'Similar images',
                subtitle: 'These images are similar to yours. Make sure not to upload duplicates',
                content: (
                    <Grid container>
                        {
                            data.map((post: any) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                                    <PostGrid value={post} newTab />
                                </Grid>
                            ))
                        }
                    </Grid>
                )
            });
            return;
        }
        enqueueSnackbar('Failed: ' + response.statusText, {
            variant: 'error'
        });
    }, [enqueueSnackbar, next]);

    return (
        <Grid container spacing={2} sx={{ pt: 2 }}>
            <RequiresLogin />
            <Grid size={{ xs: 12, md: 6 }}>
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
                {!_.isEmpty(files) &&
                    <Image
                        alt="Preview"
                        className="w-full h-auto max-h-96 object-contain"
                        src={files[0].url}
                        height={300}
                        width={300} />
                }
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2} alignItems="center" sx={{ m: 2 }}>
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

                    <FormControlLabel
                        control={
                            <Checkbox checked={ignoreSimilar} onChange={(e, c) => setIgnoreSimilar(c)} />
                        }
                        label="Ignore similar" />

                    <Box sx={{ p: 1, position: 'relative' }} >

                        <Stack direction="row" spacing={2}>

                            <Tooltip title="Submit">
                                <span>
                                    <Fab onClick={() => submit(metadata, ignoreSimilar, files[0].blob)} color="primary" disabled={loading || files.length == 0}>
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
            <Dialog onClose={() => setDialog({
                ...dialog,
                open: false
            })} open={dialog.open} maxWidth="md" fullWidth>
                <DialogTitle>{dialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialog.subtitle}
                    </DialogContentText>
                    <Box sx={{ m: 2 }}>
                        {dialog.content}
                    </Box>
                </DialogContent>
            </Dialog>
        </Grid>
    );
}
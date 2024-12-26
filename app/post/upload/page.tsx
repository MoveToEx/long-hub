'use client';

import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import PostGrid from '@/components/PostGridItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import _ from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

import { useUser, useTags, useSearchResult, SearchQuery } from '@/app/context';
import { Rating } from '@prisma/client';

import RatingComponent from '@/components/Rating';
import Container from '@mui/material/Container';
import RatingIcon from '@/components/RatingIcon';
import DragDrop from '@/components/DragDrop';

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
    const [meta, setMeta] = useState({
        text: '',
        rating: Rating.none as Rating,
        tags: [] as string[]
    });
    const [dialog, setDialog] = useState<DialogInfo>({
        open: false
    });
    const tags = useTags();
    const [ignoreSimilar, setIgnoreSimilar] = useState(false);

    const { data: user } = useUser();
    const router = useRouter();

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (user === null) {
            router.push('/account/login');
        }
    }, [user, router]);

    const next = useCallback(() => {
        if (files.length == 0) return;

        setMeta({
            text: '',
            rating: Rating.none,
            tags: []
        });
        setIgnoreSimilar(false);
        URL.revokeObjectURL(files[0].url);
        setFiles(files => _.slice(files, 1));
    }, [files]);

    const submit = useCallback(async (text: string, tags: string[], rating: Rating, force: boolean, blob: Blob) => {
        const fd = new FormData();
        fd.append('force', force ? '1' : '0');
        fd.append('image', blob);
        fd.append('metadata', JSON.stringify({ text, tags, rating }));

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
            <Grid size={{ xs: 12, md: 6 }}>
                {files.length == 0 &&
                    <DragDrop
                        accept={"image/*"}
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
                        value={meta.text}
                        type="text"
                        autoComplete="off"
                        name="text"
                        onChange={(e) => {
                            setMeta({
                                ...meta,
                                text: e.target.value
                            });
                        }}
                    />
                    <Autocomplete
                        multiple
                        freeSolo
                        value={meta.tags}
                        fullWidth
                        options={tags.data?.map(val => val.name) || []}
                        onChange={(__, newValue) => {
                            if (newValue.length == 0 || /^[a-z0-9_]+$/.test(_.last(newValue) ?? '')) {
                                setMeta({
                                    ...meta,
                                    tags: newValue
                                });
                            }
                        }}
                        renderOption={(props, option) => {
                            return <li {...props} key={option}>{option}</li>;
                        }}
                        renderTags={(value, getTagProps) =>
                            value.map((option: string, index: number) => (
                                <Chip {...getTagProps({ index })} variant="outlined" label={option} key={index} />
                            ))
                        }
                        renderInput={
                            (params) => (
                                <TextField
                                    {...params}
                                    label="Tags"
                                    error={!/^[a-z0-9_]*$/.test(params.inputProps.value as string ?? '')}
                                    helperText={"Only lower case, digits and underline are allowed in tags"}
                                    variant="outlined"
                                    slotProps={{
                                        input: {
                                            ...params.InputProps,
                                            endAdornment: tags.isLoading ? <CircularProgress size={20} /> : <></>
                                        }
                                    }} />
                            )
                        }
                    />
                    <Box className="flex w-full items-center">
                        <Tooltip title="Rating">
                            <RatingIcon />
                        </Tooltip>
                        <RatingComponent
                            value={meta.rating}
                            onChange={(_, newValue) => {
                                setMeta({
                                    ...meta,
                                    rating: newValue
                                });
                            }} />
                        <Box sx={{ ml: 1 }}>
                            {_.upperFirst(meta.rating)}
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
                                    <Fab onClick={() => submit(meta.text, meta.tags, meta.rating, ignoreSimilar, files[0].blob)} color="primary" disabled={loading || files.length == 0}>
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

                            <SearchButton text={meta.text} tags={meta.tags} />
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
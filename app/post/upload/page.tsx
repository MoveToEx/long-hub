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

import { ReactNode, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import _ from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

import { useUser } from '@/app/context';
import { useTags } from '@/app/context';
import DropArea from '@/components/DropArea';
import { Rating } from '@prisma/client';

import styles from './page.module.css';
import RatingComponent from '@/components/Rating';
import ratingIcon from '@/public/rating.png';

interface Preview {
    file: File,
    url: string
};

interface DialogInfo {
    open: boolean;
    title?: string;
    subtitle?: string;
    content?: ReactNode;
};

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

    let elem;

    useEffect(() => {
        if (!user) {
            router.push('/account/login');
        }
    }, [user, router]);

    function next() {
        setMeta({
            text: '',
            rating: Rating.none,
            tags: []
        });
        setIgnoreSimilar(false);
        setFiles(_.slice(files, 1));
    }

    async function submit() {
        setLoading(true);

        var fd = new FormData();
        fd.append('force', ignoreSimilar ? '1' : '0');
        fd.append('image', files[0].file);
        fd.append('metadata', JSON.stringify(meta));

        const response = await fetch('/api/post', {
            method: 'POST',
            body: fd,
        });

        if (response.ok) {
            next();
            enqueueSnackbar('Uploaded successfully', {
                variant: 'success'
            });
        }
        else if (response.status == 409) {
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
        }
        else {
            enqueueSnackbar('Failed: ' + response.statusText, {
                variant: 'error'
            });
        }
        setLoading(false);
    }

    function skip() {
        next();
        enqueueSnackbar('Skipped 1 image', {
            variant: 'info'
        });
    }

    async function search() {
        if (!meta.text && meta.tags.length == 0) {
            enqueueSnackbar('No condition given', { variant: 'info' });
            return;
        }
        setLoading(true);

        const selector = meta.tags.map(val => ({
            type: 'tag',
            op: 'include',
            value: val
        }));

        if (meta.text) {
            selector.push({
                type: 'text',
                op: 'contains',
                value: meta.text
            });
        }

        const response = await fetch('/api/post/search?offset=0&limit=24', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selector)
        })

        if (!response.ok) {
            enqueueSnackbar('Failed: ' + response.statusText, { variant: 'error' });
            setLoading(false);
            return;
        }

        const data = await response.json();

        setDialog({
            open: true,
            title: 'Search result',
            subtitle: `${data.count} result(s) in total` + (data.count > 24 ? `, ${data.count - 24} result(s) omitted` : ''),
            content: (
                <Grid container>
                    {
                        data.data.map((post: any) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                                <PostGrid value={post} newTab />
                            </Grid>
                        ))
                    }
                </Grid>
            )
        });

        setLoading(false);
    }

    if (files.length == 0) {
        elem = (
            <DropArea
                accept="image/*"
                multiple
                label={
                    <Typography variant="button" fontSize="24px" display="block" gutterBottom>
                        SELECT FILE
                    </Typography>
                }
                className={styles.droparea}
                dragClassName={styles.droparea_hover}
                onChange={files => {
                    setFiles(files.map(file => ({
                        file: file,
                        url: URL.createObjectURL(file)
                    })));
                }}
            />
        )
    }
    else {
        elem = (
            <Grid container spacing={2} sx={{ paddingTop: '16px' }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Image
                        id="preview-image"
                        alt="Preview"
                        src={files[0].url}
                        height={300}
                        width={0}
                        style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '300px',
                            objectFit: 'contain'
                        }} />
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
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
                            autoFocus
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
                            options={
                                tags.data?.map(val => val.name) || []
                            }
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
                        <Box alignItems="center" sx={{ width: '100%', display: 'flex' }}>
                            <Tooltip title="Rating">
                                <Image src={ratingIcon} alt="rating" width={24} height={24} style={{
                                    margin: '4px 8px 4px 8px'
                                }} />
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

                        <FormControlLabel control={<Checkbox checked={ignoreSimilar} onChange={(e, c) => setIgnoreSimilar(c)} />} label="Ignore similar" />

                        <Box sx={{ p: 1, position: 'relative' }} >

                            <Stack direction="row" spacing={2}>

                                <Tooltip title="Submit">
                                    <Fab onClick={submit} color="primary" disabled={loading}>
                                        <SendIcon />
                                    </Fab>
                                </Tooltip>

                                <Tooltip title="Skip current image">
                                    <Fab onClick={skip} color="error" disabled={loading}>
                                        <DeleteIcon />
                                    </Fab>
                                </Tooltip>

                                <Tooltip title="Search with given conditions">
                                    <Fab onClick={search} color="secondary" disabled={loading}>
                                        <SearchIcon />
                                    </Fab>
                                </Tooltip>
                            </Stack>
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
        )
    }

    return (
        <>
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
            </Dialog >

            {elem}
        </>
    )

}
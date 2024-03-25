'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import Rating from '@mui/material/Rating';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import LinkImageGrid from '@/components/LinkImageGrid';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';

import { ReactNode, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import _ from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PostMetadata from '@/lib/types/PostMetadata';

import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

import { useUser } from '@/app/context';
import DropArea from '@/components/DropArea';

import styles from './page.module.css';
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
    const [meta, setMeta] = useState<PostMetadata>({
        text: '',
        aggr: 0,
        tags: []
    });
    const [dialog, setDialog] = useState<DialogInfo>({
        open: false
    });
    const [tags, setTags] = useState<string[]>([]);
    const [ignoreSimilar, setIgnoreSimilar] = useState(false);

    const { user } = useUser();
    const router = useRouter();

    const { enqueueSnackbar } = useSnackbar();

    let elem;

    useEffect(() => {
        if (user === null) {
            router.push('/account/login');
        }
    }, [user, router]);

    useEffect(() => {
        fetch('/api/post/tag')
            .then(val => val.json())
            .then(x => setTags(x.map((x: any) => x.name)));
    }, []);

    function next() {
        setMeta({
            text: '',
            aggr: 0,
            tags: []
        });
        setIgnoreSimilar(false);
        setFiles(_.slice(files, 1));
    }

    function submit() {
        setLoading(true);
        var fd = new FormData();
        fd.append('force', ignoreSimilar ? '1' : '0');
        fd.append('image', files[0].file);
        fd.append('metadata', JSON.stringify(meta));

        fetch('/api/post', {
            method: 'POST',
            body: fd,
        })
            .then(response => {
                if (response.ok) {
                    next();
                    enqueueSnackbar('Uploaded successfully', {
                        variant: 'success'
                    });
                }
                else if (response.status == 409) {
                    response.json().then(data => {
                        setDialog({
                            open: true,
                            title: 'Similar images',
                            subtitle: 'These images are similar to yours. Make sure not to upload duplicates',
                            content: (
                                <LinkImageGrid
                                    src={data.map((post: any) => ({
                                        href: `/post/${post.id}`,
                                        src: post.imageURL
                                    }))}
                                    gridProps={{
                                        md: 6,
                                        xs: 12
                                    }}
                                    gridContainerProps={{
                                        spacing: 2
                                    }}
                                    linkProps={{
                                        target: '_blank'
                                    }} />
                            )
                        });
                    });
                }
                else {
                    enqueueSnackbar('Failed: ' + response.statusText, {
                        variant: 'error'
                    });
                }
            })
            .finally(() => setLoading(false));
    }

    function skip() {
        next();
        enqueueSnackbar('Skipped 1 image', {
            variant: 'info'
        });
    }

    function search() {
        if (!meta.text && meta.tags.length == 0) {
            enqueueSnackbar('No text given', { variant: 'info' });
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
                op: 'include',
                value: meta.text
            });
        }

        fetch('/api/post/search?offset=0&limit=24', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selector)
        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        }).then(data => {
            setDialog({
                open: true,
                title: 'Search result',
                subtitle: `${data.count} result(s) in total` + (data.count > 24 ? `, ${data.count - 24} result(s) omitted` : ''),
                content: (
                    <LinkImageGrid
                        src={data.data.map((post: any) => ({
                            href: `/post/${post.id}`,
                            src: post.imageURL
                        }))}
                        gridProps={{
                            md: 6,
                            xs: 12
                        }}
                        gridContainerProps={{
                            spacing: 2
                        }}
                        linkProps={{
                            target: '_blank'
                        }} />
                )
            });
        }).catch((reason) => {
            enqueueSnackbar('Failed: ' + reason, { variant: 'error' });
        }).finally(() => {
            setLoading(false);
        });
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
                <Grid item xs={12} md={4}>
                    <Image
                        id="preview-image"
                        alt="Preview"
                        src={files[0].url}
                        height={500}
                        width={0}
                        style={{
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain'
                        }} />
                </Grid>
                <Grid item xs={12} md={8}>
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
                                tags || []
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
                                        variant="outlined" />
                                )
                            }
                        />
                        <Box alignItems="center">
                            <Typography component="legend">Aggressiveness</Typography>
                            <Rating
                                value={meta.aggr}
                                precision={0.5}
                                max={10}
                                size="large"
                                onChange={(_event, newValue) => {
                                    setMeta({
                                        ...meta,
                                        aggr: newValue ?? 0
                                    });
                                }}
                            />
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

                        <Typography variant="subtitle2">
                            Make sure to read <Link href="/doc/guide/uploading" target="_blank">upload docs</Link> first.
                        </Typography>
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
'use client';

import Grid from '@mui/material/Grid';
import Image from 'next/image';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Fab from '@mui/material/Fab';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import _ from 'lodash';

export default function Post({
    params
}: {
    params: {
        id: String
    }
}) {
    const [loading, setLoading] = useState(true);
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [text, setText] = useState('');
    const [image, setImage] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [aggr, setAggr] = useState(0);
    const [tagsLib, setTagsLib] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        axios.get(process.env.NEXT_PUBLIC_BACKEND_HOST + '/post/' + params.id)
            .then((x: any) => {
                setText(x.data.text);
                setImage(x.data.imageURL);
                setTags(x.data.tags.map((x: any) => x.name));
                setAggr(x.data.aggr);
            })
            .finally(() => {
                setLoading(false);
                setButtonDisabled(false);
            });
        axios.get(process.env.NEXT_PUBLIC_BACKEND_HOST + '/tag')
            .then(x => setTagsLib(x.data.map((x: any) => x.name)));
    }, [params.id]);

    useEffect(() => {
        console.log(text);
    }, [text]);

    function submit() {
        setLoading(true);
        setButtonDisabled(true);
        var meta = {
            text: text,
            tags: tags,
            aggr: aggr
        };
        console.log(meta);
        axios.put(process.env.NEXT_PUBLIC_BACKEND_HOST + `/post/${params.id}/`, meta)
            .then(() => router.push(`/post/${params.id}/`));
    }


    return (
        <Grid container spacing={2} sx={{ paddingTop: '16px', paddingBottom: '16px' }}>
            <Grid item xs={12} md={4}>
                {image ?
                    <Image
                        id="preview-image"
                        alt="Preview"
                        src={image}
                        height={0}
                        width={0}
                        sizes="100vw"
                        style={{
                            width: '100%',
                            height: 'auto'
                        }} />
                    : <></>}
            </Grid>
            <Grid item xs={12} md={8}>
                <Stack spacing={2} alignItems="center" sx={{mb: 2}}>
                    <TextField
                        label="Text"
                        fullWidth
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                        }}
                    />
                    <Autocomplete
                        multiple
                        freeSolo
                        value={tags}
                        fullWidth
                        options={
                            tagsLib || []
                        }
                        onChange={(__, newValue) => {
                            setTags(newValue);
                        }}
                        renderOption={(props, option) => {
                            return (
                                <li {...props} key={option}>
                                    {option}
                                </li>
                            );
                        }}
                        renderTags={(value: readonly string[], getTagProps) =>
                            value.map((option: string, index: number) => (
                                <Chip {...getTagProps({ index })} variant="outlined" label={option} key={index} />
                            ))
                        }
                        renderInput={
                            (params) => (
                                <TextField
                                    {...params}
                                    label="Tags"
                                    variant="outlined" />
                            )
                        }
                    />
                    <Box alignItems="center">
                        <Typography component="legend">Aggressiveness</Typography>
                        <Rating
                            value={aggr}
                            precision={0.5}
                            max={10}
                            size="large"
                            onChange={(event, newValue) => {
                                setAggr(newValue ?? 0);
                            }}
                        />
                    </Box>

                    <Box sx={{ m: 1, position: 'relative' }}>
                        <Fab onClick={submit} color="primary" disabled={buttonDisabled}>
                            <SendIcon />
                        </Fab>
                        {
                            loading && (
                                <CircularProgress
                                    size={68}
                                    sx={{
                                        position: 'absolute',
                                        top: -6,
                                        left: -6,
                                        zIndex: 1
                                    }}
                                />
                            )
                        }
                    </Box>
                </Stack>
            </Grid>
        </Grid>
    )
}
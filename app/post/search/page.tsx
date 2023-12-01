'use client';

import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinkImageGrid from '@/components/LinkImageGrid';
import { useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import Autocomplete from '@mui/material/Autocomplete';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Base64 } from 'js-base64';
import { parseSelector } from '@/lib/types/SearchSelector';
import { PostsResponse } from '@/lib/types/PostResponse';
import { TagsResponse } from '@/lib/types/TagResponse';

const PAGINATION_LIMIT = 24;

export default function SearchPage() {
    const [page, setPage] = useState(1);
    const [result, setResult] = useState<PostsResponse | null>(null);
    const [inputValue, setInputValue] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    const router = useRouter();
    const searchParam = useSearchParams();
    const { enqueueSnackbar } = useSnackbar();

    function onPage(e: React.ChangeEvent<unknown>, val: number) {
        setResult(null);
        setPage(val);
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }

    useEffect(() => {
        if (!searchParam.has("s")) return;

        var decoded = JSON.parse(Base64.decode(decodeURIComponent(searchParam.get("s") ?? '')));
        var selector = JSON.stringify(parseSelector(decoded));

        setInputValue(decoded);
        axios.get('/api/search/?s=' + encodeURIComponent(Base64.encode(selector)) + '&offset=' + ((page - 1) * 24).toString())
            .then(({ data }: { data: PostsResponse }) => setResult(data))
            .catch(_ => enqueueSnackbar('Failed when fetching data', { variant: 'error' }));
    }, [searchParam, enqueueSnackbar, page]);

    useEffect(() => {
        if (_.isEmpty(inputValue)) return;
        var encoded = Base64.encode(JSON.stringify(inputValue));

        router.push('/post/search?s=' + encodeURIComponent(encoded));
    }, [inputValue, router]);

    useEffect(() => {
        axios.get('/api/tag/')
            .then(({ data }: { data: TagsResponse }) => setTags(data.map(i => i.name)));
    }, []);

    return (
        <>
            <Autocomplete
                multiple
                freeSolo
                value={inputValue}
                fullWidth
                sx={{ mt: 2 }}
                options={
                    tags || []
                }
                renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
                    ))
                }
                renderOption={(props, option) => {
                    return <li {...props} key={option}>{option}</li>;
                }}
                filterOptions={(options, { inputValue }) => {
                    if (inputValue.startsWith('+') || inputValue.startsWith('-')) {
                        return options
                            .filter(x => x.startsWith(_.trimStart(inputValue, '+-')))
                            .map(x => inputValue[0] + x);
                    }
                    else {
                        return [];
                    }
                }}
                onChange={(_, newValue) => {
                    setResult(null);
                    setInputValue(newValue);
                    setPage(1);
                }}
                renderInput={
                    (params) => (
                        <TextField
                            {...params}
                            sx={{ margin: '16px 0 16px 0' }}
                            placeholder="Selector"
                            label="Search"
                            variant="outlined" />
                    )
                }
            />

            <Typography variant="h6" align="center">
                {result === null ? <></> : 'Found ' + result.count + ' results'}
            </Typography>
            {
                <LinkImageGrid
                    src={!result ? [] : result.data.map((x: any) => ({
                        href: `/post/${x.id}`,
                        src: x.imageURL
                    }))}
                    gridContainerProps={{
                        spacing: 2
                    }}
                    gridProps={{
                        xs: 12,
                        sm: 6,
                        md: 3
                    }} />
            }

            <Stack alignItems="center" sx={{ marginTop: '24px' }}>
                <Pagination count={!result ? 0 : Math.ceil(result.count / PAGINATION_LIMIT)}
                    siblingCount={0}
                    page={page}
                    onChange={onPage} />
            </Stack>
        </>
    );
}
'use client';

import TextField from '@mui/material/TextField';
import Image from 'next/image'
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'next/link';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import Autocomplete from '@mui/material/Autocomplete';
import { useRouter, useSearchParams } from 'next/navigation';
import { Base64 } from 'js-base64';

const PAGINATION_LIMIT = 24;

function startsWith(s: string, pattern: string[]) {
    return pattern.map((val: string) => s.startsWith(val)).reduce((x, y) => x || y);
}

function toQuerySelector(items: string[]) {
    return {
        text: items.filter(s => !startsWith(s, ['+', '-', '@', '>', '<'])),
        tag: {
            include: items.filter(s => s.startsWith('+')).map(s => _.trimStart(s, '+')),
            exclude: items.filter(s => s.startsWith('-')).map(s => _.trimStart(s, '-')),
        },
        aggr: _.mapValues(_.pickBy({
            gte: items.find(s => />=[\d.]+/.test(s)),
            lte: items.find(s => /<=[\d.]+/.test(s)),
            gt: items.find(s => />[\d.]+/.test(s)),
            lt: items.find(s => /<[\d.]+/.test(s)),
        }), s => Number(_.trimStart(s, '<=>'))),
        id: items.filter(s => s.startsWith('@')).map(s => _.trimStart(s, '@'))
    }
}

function toGridItems(res: any) {
    var elem;
    if (_.isEmpty(res)) {
        elem = _.range(PAGINATION_LIMIT).map((x: number) => (
            <>
                <Skeleton variant="rectangular" height={128} />
                <Skeleton variant="text" height={24} />
                <Skeleton variant="text" height={24} />
            </>
        ))
    }
    else {
        elem = res.data.map((e: any, i: number) => (
            <Link href={`/post/${e.id}`} key={i}>
                <Image
                    src={e.image}
                    alt={e.text}
                    height={0}
                    width={0}
                    sizes='100vw'

                    style={{
                        width: '100%',
                        height: '300px',
                        objectFit: 'contain'
                    }}
                />
            </Link>
        ))
    }
    return elem.map((e: any, i: number) => (
        <Grid xs={12} sm={6} md={3} key={i}>
            {e}
        </Grid>
    ));
}

export default function SearchPage() {
    const [query, setQuery] = useState<any>({});
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [inputValue, setInputValue] = useState<string[]>([]);
    const [tags, setTags] = useState([]);
    const router = useRouter();
    const searchParam = useSearchParams();

    function onPage(e: React.ChangeEvent<unknown>, val: number) {
        setResult({});
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
        var selector = JSON.stringify(toQuerySelector(decoded));
        
        setInputValue(decoded);
        axios.get('/api/search/' + encodeURIComponent(Base64.encode(selector)) + '?offset=' + ((page - 1) * 24).toString())
            .then(x => setResult(x.data));
    }, [searchParam]);
    
    useEffect(() => {
        if (_.isEmpty(inputValue)) return;
        var encoded = Base64.encode(JSON.stringify(inputValue));

        router.push('/post/search?s=' + encodeURIComponent(encoded));
    }, [query, page, inputValue]);

    useEffect(() => {
        axios.get('/api/tag/')
            .then(x => setTags(x.data.map((i: any) => i.name)));
    }, []);

    return (
        <>
            <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
                <Alert severity='error' onClose={() => setSnackbarOpen(false)}>
                    Failed when fetching data.
                </Alert>
            </Snackbar>
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
                onChange={(__, newValue) => {
                    setResult({});
                    setInputValue(newValue);
                    setQuery(toQuerySelector(newValue));
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
                {_.isEmpty(result) ? <></> : 'Found ' + (result as any).count + ' results'}
            </Typography>

            <Grid container spacing={2}>
                {_.isEmpty(result) ? <></> : toGridItems(result)}
            </Grid>

            <Stack alignItems="center" sx={{ marginTop: '24px' }}>
                <Pagination count={_.isEmpty(result) ? 0 : Math.ceil((result as any).count / PAGINATION_LIMIT)}
                    siblingCount={0}
                    page={page}
                    defaultPage={4}
                    onChange={onPage} />
            </Stack>
        </>
    )
}
'use client';

import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Tooltip from '@mui/material/Tooltip';
import PostGrid from '@/components/PostGridItem';

import { useCallback, useState } from 'react';
import { useSnackbar } from 'notistack';
import _ from 'lodash';

import SearchIcon from '@mui/icons-material/Search';

import { useSearchResult, SearchQuery } from '@/app/context';

export function SearchButton({
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
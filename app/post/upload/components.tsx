'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Posts from '@/components/Posts';

import { useCallback, useState } from 'react';
import { useSnackbar } from 'notistack';
import _ from 'lodash';

import SearchIcon from '@mui/icons-material/Search';

import { useSearchResult, SearchQuery } from '@/app/context';

export function SearchButton({
    text,
    tags,
    disabled
}: {
    text: string,
    tags: string[],
    disabled: boolean
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
            <Button
                onClick={() => {
                    setQuery(transform(text, tags));
                    setOpen(true);
                }}
                color="secondary"
                startIcon={<SearchIcon />}
                loading={isLoading}
                disabled={disabled}>
                search
            </Button>

            <Dialog
                onClose={() => setOpen(false)}
                open={open && !isLoading && data !== undefined}
                maxWidth="md"
                fullWidth>

                <DialogTitle>Search Result</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {`${data?.count} result(s) in total`}
                    </DialogContentText>
                    <Box sx={{ m: 2 }}>
                        <Posts
                            layout='grid'
                            posts={data?.data}
                            allowCopy={false}
                            slotProps={{
                                grid: {
                                    size: {
                                        xs: 12,
                                        sm: 6,
                                        md: 4
                                    }
                                },
                                link: {
                                    target: '_blank'
                                }
                            }} />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    )
}
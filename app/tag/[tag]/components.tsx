'use client';

import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import Select from '@mui/material/Select';
import * as C from '@/lib/constants';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export default function EditTag({
    tag,
    summary,
    description,
    type
}: {
    tag: string,
    summary: string,
    description: string,
    type: string
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState({
        summary: summary ?? '',
        description: description ?? '',
        type: type ?? 'Unset'
    });

    function submit() {
        setLoading(true);
        axios.post('/api/tag/' + tag, meta).then(() => {
            window.location.reload();
        });
    }

    return (
        <>
            <Dialog open={open} maxWidth="md" fullWidth onClose={() => setOpen(false)} disableScrollLock>
                <DialogTitle>
                    <Typography variant="h4">
                        Edit tag {tag}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Stack sx={{ m: 2 }} spacing={2}>
                        <FormControl sx={{ m: 1 }}>

                            <InputLabel id="type-label">Type</InputLabel>
                            <Select
                                labelId="type-label"
                                value={meta.type}
                                label="Type"
                                onChange={(e) => {
                                    setMeta({
                                        ...meta,
                                        type: e.target.value
                                    })
                                }}>
                                {C.tagTypes.map((t, i) => (
                                    <MenuItem key={i} value={t}>{t}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            label="Summary"
                            value={meta.summary}
                            onChange={e => setMeta({ ...meta, summary: e.target.value })} />
                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={5}
                            value={meta.description}
                            onChange={e => setMeta({ ...meta, description: e.target.value })} />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button variant="text" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="text" disabled={loading} onClick={submit}>Submit</Button>
                </DialogActions>
            </Dialog >

            <Button variant="outlined" onClick={() => setOpen(true)}>Edit</Button>
        </>
    )
}
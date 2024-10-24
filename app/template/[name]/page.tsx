'use client';

import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import _ from 'lodash';
import Image from 'next/image';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Fab from '@mui/material/Fab';
import { useState, useEffect, useRef, use } from 'react';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import TemplateResponse from '@/lib/types/TemplateResponse';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Rnd } from 'react-rnd';
import { useSnackbar } from 'notistack';

export default function TemplatePage({
    params
}: {
    params: Promise<{ name: string }>
}) {
    const { name } = use(params);
    const image = useRef<HTMLImageElement>(null);
    const [template, setTemplate] = useState<TemplateResponse | null>(null);
    const [text, setText] = useState('');
    const [overrideRect, setOverrideRect] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const { enqueueSnackbar } = useSnackbar();
    const [rect, setRect] = useState({
        x: 0,
        y: 0,
        height: 0,
        width: 0
    });

    function write(blobs: Record<string, Blob>) {
        const item = new ClipboardItem(blobs);
        navigator.clipboard.write([item])
            .then(() => enqueueSnackbar('Copied to clipboard', { variant: 'success' }))
            .catch((e) => enqueueSnackbar('Failed when copying: ' + e, { variant: 'error' }));
    }

    function transform(x: number, rev: boolean = false) {
        if (image.current === null) return 0;
        const ratio = image.current.height / image.current.naturalHeight;
        return Math.round(rev ? x * ratio : x / ratio);
    }

    useEffect(() => {
        fetch('/api/template/' + name)
            .then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(data => {
                setTemplate(data);

                setRect({
                    x: data.offsetX,
                    y: data.offsetY,
                    height: data.rectHeight,
                    width: data.rectWidth
                });
            })
            .catch(reason => {
                enqueueSnackbar(reason, { variant: 'error' });
            });
    }, [name, enqueueSnackbar]);

    function submit() {
        const data = {
            text: text,
            rect: (overrideRect ? rect : {})
        };

        fetch('/api/template/' + name + '/generate', {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.blob();
        }).then(blob => {
            setResult(URL.createObjectURL(blob));
            write({
                'image/png': blob
            });
            setDialogOpen(true);
        }).catch(reason => {
            enqueueSnackbar(reason, { variant: 'error' });
        });
    }

    return (
        <>
            <Dialog onClose={() => setDialogOpen(!dialogOpen)} open={dialogOpen} maxWidth="md" fullWidth>
                <DialogTitle>Result</DialogTitle>
                <DialogContent>
                    <Stack alignItems="center">
                        {result &&
                            <Image
                                alt="result"
                                src={result}
                                width={256}
                                height={256}
                                style={{
                                    objectFit: 'contain'
                                }}
                            />
                        }
                    </Stack>
                </DialogContent>
            </Dialog >

            <Grid container spacing={2} sx={{ pt: 2, pb: 2 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    {template && <>
                        <Image
                            unoptimized
                            ref={image}
                            height={300}
                            width={300}
                            className="preview-image"
                            src={template.imageURL}
                            alt={name}
                            style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain'
                            }}
                        />
                        {overrideRect && <Rnd
                            default={{
                                x: 0,
                                y: 0,
                                width: 100,
                                height: 100
                            }}
                            bounds=".preview-image"
                            onDrag={(e, data) => {
                                const img = image.current?.getBoundingClientRect()!;
                                const box = data.node.getBoundingClientRect();
                                setRect({
                                    ...rect,
                                    x: transform(box.x - img.left),
                                    y: transform(box.y - img.top)
                                });
                            }}
                            onResize={(e, dir, ref) => {
                                const img = image.current?.getBoundingClientRect()!;
                                const box = ref.getBoundingClientRect();
                                setRect({
                                    x: transform(box.x - img.left),
                                    y: transform(box.y - img.top),
                                    height: transform(box.height),
                                    width: transform(box.width)
                                });
                            }}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                border: '3px grey dashed'
                            }} />}
                    </>
                    }
                </Grid>
                <Grid size={{ xs: 12, md: 8 }} sx={{ mt: '16px' }}>
                    <Stack alignItems="right" spacing={1}>
                        <Typography variant="h4">
                            Template {name}
                        </Typography>

                        <TextField
                            label="Text"
                            multiline
                            value={text}
                            fullWidth
                            type="text"
                            autoComplete="off"
                            autoFocus
                            onChange={e => {
                                setText(e.target.value);
                            }}
                        />

                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={overrideRect}
                                        onChange={e => {
                                            setRect({
                                                x: 0,
                                                y: 0,
                                                height: 100,
                                                width: 100
                                            });
                                            setOverrideRect(e.target.checked)
                                        }}
                                    />
                                }
                                label={"Override rectangle"} />
                        </FormGroup>
                    </Stack>

                    <Stack alignItems="center">
                        <Fab onClick={submit} color="primary">
                            <SendIcon />
                        </Fab>
                    </Stack>
                </Grid>
            </Grid>
        </>
    )
}
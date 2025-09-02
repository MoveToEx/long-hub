'use client';

import { useMemo, useState } from "react";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';

import AutorenewIcon from '@mui/icons-material/Autorenew';

import CopiableText from "@/components/CopiableText";
import KeyVal, { type Descriptor } from "@/components/keyval/KeyVal";
import { useSession } from "../context";
import { z } from 'zod';

export function InfoTab() {
    const { data, error, isLoading } = useSession();

    if (isLoading) {
        return <Skeleton />
    }

    if (error) {
        return <span> Failed when fetching </span>
    }

    if (!data) {
        return <span> Unknown error </span>
    }

    return (
        <div>
            <div className='flex'>
                UID&nbsp;=&nbsp;<b>{data.id}</b>
            </div>
            <div className='flex'>
                Registered at&nbsp;<b>{data.createdAt}</b>
            </div>
        </div>
    )
}

export function APITab() {
    const { data, error, isLoading, mutate } = useSession();
    const [disabled, setDisabled] = useState(false);

    if (isLoading) {
        return <Skeleton />
    }

    if (error) {
        return <span> Failed when fetching </span>
    }

    if (!data) {
        return <span> Unknown error </span>
    }

    return (
        <div>
            <Grid container>
                <Grid size={{
                    xs: 12,
                    md: 8
                }} offset={{
                    md: 2
                }}>
                    <div className='flex flex-row justify-between items-baseline w-full'>
                        <Typography variant='subtitle1'>API Access Key</Typography>
                        <div className='flex flex-col items-end gap-2'>
                            <CopiableText text={data.accessKey} />
                            <Button
                                startIcon={<AutorenewIcon />}
                                color='error'
                                onClick={async () => {
                                    setDisabled(true);
                                    await fetch('/api/auth/reset-key');
                                    await mutate();
                                    setDisabled(false);
                                }}
                                disabled={disabled}
                            >
                                reset
                            </Button>
                        </div>
                    </div>
                </Grid>
            </Grid>

            <div>
                <Typography variant='subtitle1'>
                    Sample request:
                </Typography>

                <pre className='bg-gray-200 font-mono p-2 rounded-sm'>
                    <span className='break-all'>GET https://longhub.top/api/auth</span>
                    <br />
                    <span className='break-all'>Authorization: Bearer {data.accessKey}</span>
                </pre>
            </div>
        </div>
    );
}

export function PreferenceTab() {
    const registry = useMemo(() => z.registry<Descriptor>(), []);

    const schema = useMemo(() => ({
        allowNSFW: z.boolean().register(registry, {
            description: 'Whether to allow for posts tagged with nsfw to appear in lists',
            label: '🔞 Allow NSFW'
        })
    }), [registry]);

    const { data, error, isLoading, mutate } = useSession();
    const [loading, setLoading] = useState(false);

    if (isLoading) {
        return <Skeleton />
    }

    if (error) {
        return <span> Failed when fetching </span>
    }

    if (!data) {
        return <span> Unknown error </span>
    }

    return (
        <div className='flex-1 min-h-48 flex flex-col justify-between'>
            <div>
                <KeyVal
                    schema={schema}
                    registry={registry}
                    value={data.preference}
                    reducer={async ({ key, value }) => {
                        setLoading(true);
                        try {
                            await fetch('/api/user/', {
                                method: 'PATCH',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    preference: {
                                        [key]: value
                                    }
                                })
                            });
                            await mutate();
                        }
                        catch (e) { }
                        finally {
                            setLoading(false);
                        }
                    }}
                    disabled={loading}
                />
            </div>


            <div>
                <Typography variant='body2' align='right'>
                    Preferences also applies to API requests made with your API key.
                </Typography>
            </div>
        </div>
    );
}
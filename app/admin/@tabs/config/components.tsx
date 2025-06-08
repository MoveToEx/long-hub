'use client';

import Box from '@mui/material/Box';
import _ from 'lodash';
import { useState } from 'react';

import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { Configuration } from '@/lib/config';
import { setConfig } from './actions';
import { useSnackbar } from 'notistack';


type ConfDescItem = {
    description: string;
} & ({
    type: 'boolean';
} | {
    type: 'string';
} | {
    type: 'select';
    select: string[]
} | {
    type: 'number';
} | {
    type: 'slider';
    max: number;
    min: number;
});

export type ConfDesc = {
    [K in keyof Configuration]: ConfDescItem
};

type ConfMapping = {
    boolean: boolean;
    string: string;
    select: string;
    number: number;
    slider: number;
}

const confs: ConfDesc = {
    allowRegistration: {
        type: 'boolean',
        description: 'Whether to allow for new user registration'
    },
    maxUploadRate: {
        type: 'number',
        description: 'Maximum allowed uploads per minute per user',
    },
    defaultPermission: {
        type: 'number',
        description: 'Permission granted to new users'
    },
    uploadSessionExpiration: {
        type: 'number',
        description: 'Maximum time an upload session can remain valid, in seconds'
    }
};

function ItemDescription({
    title,
    description
}: {
    title: string,
    description: string
}) {
    return (
        <Box className="flex flex-col">
            <Typography>
                {title}
            </Typography>
            <Typography variant="caption" color='textSecondary'>
                {description}
            </Typography>
        </Box>
    )
}

export function BooleanItem({
    value,
    onChange,
}: {
    value: boolean,
    onChange: (val: boolean) => Promise<void>
}) {
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    return (
        <Switch
            onChange={async (_, val) => {
                setLoading(true);
                try {
                    await onChange(val);
                    enqueueSnackbar('Value updated', { variant: 'success' });
                }
                catch (e) {
                    enqueueSnackbar('Failed when updating value: ' + String(e), { variant: 'error' });
                }
                setLoading(false);
            }}
            disabled={loading}
            checked={value} />
    );
}

export function NumberItem({
    value,
    onChange,
}: {
    value: number,
    onChange: (val: number) => Promise<void>
}) {
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState(value.toString());
    const { enqueueSnackbar } = useSnackbar();
    return (
        <TextField
            disabled={loading}
            type='number'
            variant='standard'
            value={input}
            onKeyDown={async (event) => {
                if (event.key == 'Enter') {
                    setLoading(true);
                    try {
                        await onChange(parseInt(input));
                        enqueueSnackbar('Value updated', { variant: 'success' });
                    }
                    catch (e) {
                        enqueueSnackbar('Failed when updating value: ' + String(e), { variant: 'error' });
                    }
                    setLoading(false);
                }
            }}
            onChange={(event) => {
                setInput(event.currentTarget.value);
            }} />
    );
}

export function ConfigItem<T extends keyof ConfMapping>({
    itemKey,
    type,
    description,
    value
}: {
    itemKey: keyof Configuration,
    type: T,
    description: string,
    value: ConfMapping[T]
}) {
    return (
        <Box
            sx={{
                px: {
                    md: 2,
                    xs: 0,
                },
                py: 0.5
            }}
            className="flex flex-row justify-between items-center">
            <ItemDescription title={itemKey} description={description} />
            {type === 'boolean' && (
                <BooleanItem
                    onChange={async (val) => {
                        await setConfig(itemKey, val);
                    }}
                    value={value as boolean} />
            )}
            {type === 'number' && (
                <NumberItem
                    onChange={async (val) => {
                        await setConfig(itemKey, val);
                    }}
                    value={value as number} />
            )}
        </Box>
    )
}


export function ConfigItems({
    conf
}: {
    conf: Configuration
}) {
    const elem = [];
    for (const k in conf) {
        const key: keyof Configuration = k as keyof Configuration;
        elem.push(
            <ConfigItem
                key={key}
                itemKey={key}
                type={confs[key].type}
                description={confs[key].description}
                value={conf[key]} />
        )
    }
    return elem;
}
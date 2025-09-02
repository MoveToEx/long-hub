'use client';

import { Configuration } from '@/lib/config';
import { setConfig } from './actions';

import KeyVal, { Descriptor } from '@/components/keyval/KeyVal';
import z from 'zod';
import { useMemo } from 'react';

export function ConfigPanel({ value }: { value: Configuration }) {
    const registry = useMemo(() => z.registry<Descriptor>(), []);

    const schema = useMemo(() => ({
        allowRegistration: z.boolean().register(registry, {
            label: 'Allow Registration',
            description: 'Whether to allow for new user registration'
        }),
        maxUploadRate: z.number().register(registry, {
            label: 'Max Upload Rate',
            description: 'How many posts a user can create within 1 min'
        }),
        defaultPermission: z.number().register(registry, {
            label: 'Default permission',
            description: 'Permission granted to new users'
        }),
        uploadSessionExpiration: z.number().register(registry, {
            label: 'Upload expiration',
            description: 'Maximum time an upload session can remain valid, in seconds'
        })
    }), [registry]);

    return (
        <KeyVal
            schema={schema}
            value={value}
            registry={registry}
            reducer={async ({ key, value }) => {
                await setConfig(key, value as Configuration[typeof key]);
            }}
            slotProps={{
                grid: {
                    size: {
                        xs: 12,
                        md: 8
                    },
                    offset: {
                        md: 2
                    }
                }
            }} />
    )
}
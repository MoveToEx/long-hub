'use client';

import { z } from 'zod';

import Typography from '@mui/material/Typography';
import BooleanInput from '@/components/keyval/BooleanInput';
import NumberInput from '@/components/keyval/NumberInput';
import SelectInput from './SelectInput';

export type KeyValSchema = {
    [key: string]: z.core.$ZodType
};

export type KeyValReducer<T extends KeyValSchema> =
    <K extends keyof T>({ key, value }: { key: K, value: z.infer<T[K]> }) => Promise<void>;

export type KeyValProps<T extends KeyValSchema> = {
    schema: T,
    registry: z.core.$ZodRegistry<Descriptor>,
    value: {
        [K in keyof T]: z.infer<T[K]>
    },
    disabled?: boolean,
    reducer: KeyValReducer<T>
};

function unwrap(schema: z.core.$ZodType) {
    if (schema instanceof z.core.$ZodOptional) {
        return unwrap(schema._zod.def.innerType);
    }
    else if (schema instanceof z.core.$ZodDefault) {
        return unwrap(schema._zod.def.innerType);
    }
    return schema;
}

export function KeyValItem<T extends z.core.$ZodType>({
    itemKey,
    label,
    description,
    schema,
    value,
    reducer,
    disabled,
}: {
    itemKey: string,
    label: string,
    description: string,
    schema: T,
    value: z.infer<T>,
    reducer: ({ key, value }: { key: string, value: z.infer<T> }) => Promise<void>,
    disabled: boolean,
}) {
    const inner = unwrap(schema);

    return (
        <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-col">
                <Typography>
                    {label}
                </Typography>
                <Typography variant="caption" color='textSecondary'>
                    {description}
                </Typography>
            </div>
            {inner instanceof z.core.$ZodBoolean && (
                <BooleanInput
                    onChange={async (val) => {
                        await reducer({ key: itemKey, value: val as z.infer<T> });
                    }}
                    value={value as boolean}
                    disabled={disabled} />
            )}
            {inner instanceof z.core.$ZodNumber && (
                <NumberInput
                    onChange={async (val) => {
                        await reducer({ key: itemKey, value: val as z.infer<T> });
                    }}
                    value={value as number}
                    disabled={disabled} />
            )}
            {inner instanceof z.core.$ZodEnum && (
                <SelectInput
                    onChange={async (val) => {
                        await reducer({ key: itemKey, value: val as z.infer<T> });
                    }}
                    value={value as string}
                    options={Object.keys(inner._zod.def.entries)}
                    disabled={disabled} />
            )}
        </div>
    )
}

export type Descriptor = {
    label: string;
    description: string;
}

export default function KeyVal<T extends KeyValSchema>({
    schema,
    registry,
    value,
    disabled = false,
    reducer
}: KeyValProps<T>) {
    const elem = [];

    for (const key in schema) {
        const item = schema[key];
        const meta = registry.get(schema[key]);
        if (!meta) continue;

        const { label, description } = meta;

        elem.push(
            <div className='my-4' key={key}>
                <KeyValItem
                    disabled={disabled}
                    reducer={reducer}
                    itemKey={key}
                    label={label}
                    schema={item}
                    description={description}
                    value={value[key]}
                />
            </div>
        )
    }
    return elem;
}
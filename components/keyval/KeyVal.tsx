'use client';

import { z } from 'zod';

import Grid, { type GridBaseProps } from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import BooleanInput from '@/components/keyval/BooleanInput';
import NumberInput from '@/components/keyval/NumberInput';

export type KeyValSchema = {
    [key: string]: z.core.$ZodType
};

export type KeyValReducer<T extends KeyValSchema> =
    <K extends keyof T>({ key, value }: { key: K, value: z.infer<T[K]> }) => Promise<void>;

export type KeyValSlotProps = {
    gridContainer?: GridBaseProps,
    grid?: GridBaseProps
};

export type KeyValProps<T extends KeyValSchema> = {
    schema: T,
    registry: z.core.$ZodRegistry<Descriptor>,
    value: {
        [K in keyof T]: z.infer<T[K]>
    },
    disabled?: boolean,
    reducer: KeyValReducer<T>,
    slotProps?: KeyValSlotProps | undefined
};

function unwrapped(schema: z.core.$ZodType) {
    if (schema instanceof z.core.$ZodOptional) {
        return unwrapped(schema._zod.def.innerType);
    }
    else if (schema instanceof z.core.$ZodDefault) {
        return unwrapped(schema._zod.def.innerType);
    }
    return schema._zod.def.type;
}

export function KeyValItem<T extends z.core.$ZodType>({
    itemKey,
    label,
    description,
    schema,
    value,
    reducer,
    disabled,
    slotProps,
}: {
    itemKey: string,
    label: string,
    description: string,
    schema: T,
    value: z.infer<T>,
    reducer: ({ key, value }: { key: string, value: z.infer<T> }) => Promise<void>,
    disabled: boolean,
    slotProps?: KeyValSlotProps,
}) {
    return (
        <Grid container {...slotProps?.gridContainer}>
            <Grid
                size={{
                    xs: 12,
                    md: 6
                }}
                offset={{
                    md: 3
                }}
                {...slotProps?.grid}>
                <div className="flex flex-row justify-between items-center w-full">
                    <div className="flex flex-col">
                        <Typography>
                            {label}
                        </Typography>
                        <Typography variant="caption" color='textSecondary'>
                            {description}
                        </Typography>
                    </div>
                    {unwrapped(schema) == 'boolean' && (
                        <BooleanInput
                            onChange={async (val) => {
                                await reducer({ key: itemKey, value: val as z.infer<T> });
                            }}
                            value={value as boolean}
                            disabled={disabled} />
                    )}
                    {unwrapped(schema) == 'number' && (
                        <NumberInput
                            onChange={async (val) => {
                                await reducer({ key: itemKey, value: val as z.infer<T> });
                            }}
                            value={value as number}
                            disabled={disabled} />
                    )}
                </div>
            </Grid>
        </Grid>
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
    reducer,
    slotProps
}: KeyValProps<T>) {

    const elem = [];
    for (const key in schema) {
        const item = schema[key];
        const meta = registry.get(schema[key]);
        if (!meta) continue;

        const { label, description } = meta;

        elem.push(
            <KeyValItem
                disabled={disabled}
                reducer={reducer}
                key={key}
                itemKey={key}
                label={label}
                schema={item}
                description={description}
                value={value[key]}
                slotProps={slotProps}
            />
        )
    }
    return (
        <div>
            {elem}
        </div>
    );
}
'use client';

import { useState } from 'react';

import TextField from '@mui/material/TextField';


export default function NumberInput({
    value,
    onChange,
    disabled = false,
}: {
    value: number,
    onChange: (val: number) => Promise<void>,
    disabled?: boolean
}) {
    const [input, setInput] = useState(value.toString());
    return (
        <TextField
            disabled={disabled}
            type='number'
            variant='standard'
            value={input}
            onKeyDown={async (event) => {
                if (event.key == 'Enter') {
                    await onChange(parseInt(input));
                }
            }}
            onChange={(event) => {
                setInput(event.currentTarget.value);
            }} />
    );
}
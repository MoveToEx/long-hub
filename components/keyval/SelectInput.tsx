'use client';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


export default function SelectInput({
    value,
    options,
    onChange,
    disabled = false,
}: {
    value: string,
    options: string[],
    onChange: (val: string) => Promise<void>,
    disabled?: boolean
}) {

    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth size='small'>
                <Select
                    disabled={disabled}
                    value={value}
                    onChange={event => onChange(event.target.value)}>
                    {options.map((val, idx) => (
                        <MenuItem key={idx} value={val}>{val}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

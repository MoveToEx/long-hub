'use client';

import _ from 'lodash';
import Switch from '@mui/material/Switch';

export default function BooleanInput({
    value,
    onChange,
    disabled = false
}: {
    value: boolean,
    onChange: (val: boolean) => Promise<void>,
    disabled?: boolean
}) {
    return (
        <Switch
            onChange={async (_, val) => {
                await onChange(val);
            }}
            disabled={disabled}
            checked={value} />
    );
}
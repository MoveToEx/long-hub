'use client';

import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import WindowIcon from '@mui/icons-material/Window';
import ViewListIcon from '@mui/icons-material/ViewList';

type Layout = 'grid' | 'list';

export default function ToggleLayout({
    value,
    onChange
}: {
    value: Layout,
    onChange: (value: Layout) => void
}) {
    return (
        <ToggleButtonGroup size="small" value={value} exclusive onChange={(event, value) => {
            if (value !== null) {
                onChange(value);
            }
        }}>
            <Tooltip title="Grid layout">
                <ToggleButton value="grid">
                    <WindowIcon />
                </ToggleButton>
            </Tooltip>
            <Tooltip title="List layout">
                <ToggleButton value="list">
                    <ViewListIcon />
                </ToggleButton>
            </Tooltip>
        </ToggleButtonGroup>
    )
}
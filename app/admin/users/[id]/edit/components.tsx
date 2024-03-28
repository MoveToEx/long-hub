'use client';

import { useState } from "react";
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';

import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

import _ from 'lodash';
import Typography from "@mui/material/Typography";

export function BitBoard({
    label,
    bitCount,
    value,
    description
}: {
    label: string,
    bitCount: number,
    value?: number[] | undefined,
    description: string[]
}) {
    const [bits, setBits] = useState<number[]>(value ? value : _.range(bitCount).map(() => 0));

    if (value && value.length != bitCount) {
        throw new Error('Bit count does not match value length');
    }

    const toggle = (x: number) => {
        return () => setBits(bits.map((val, idx) => idx == x ? (1 ^ val) : val));
    }

    return (
        <Box sx={{ p: 2 }}>
            <input type="hidden" name="permission" value={bits.reduceRight((x, y) => (x << 1 | y))} />
            <Typography variant="h6">{label}</Typography>
            <ButtonGroup sx={{
                display: {
                    xs: 'none',
                    md: 'block'
                }
            }}>
                {
                    _.range(bitCount).map(x => (
                        <Tooltip title={description[x]} key={x}>
                            <Button
                                variant={bits[x] == 0 ? "outlined" : "contained"}
                                onClick={toggle(x)}
                                disabled={description[x] == ''}>
                                {bits[x]}
                            </Button>
                        </Tooltip>
                    ))
                }
            </ButtonGroup>
            <Box sx={{
                display: {
                    xs: 'block',
                    md: 'none'
                }
            }}>
                {
                    _.range(bitCount).map(x => (
                        description[x] && 
                        <FormControlLabel
                            key={x}
                            control={
                                <Checkbox
                                    checked={bits[x] == 1}
                                    onClick={toggle(x)}
                                />
                            }
                            label={description[x]} />
                    ))
                }
            </Box>
        </Box>
    )
}
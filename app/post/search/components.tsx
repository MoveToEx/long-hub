'use client';

import _ from 'lodash';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useTags } from '@/app/context';
import { Rating } from '@prisma/client';
import { useState } from 'react';
import { startsWith } from '@/lib/util';

const ratingValues = [
    ...Object.values(Rating).map(val => val[0]),
    ...Object.values(Rating),
];
const sysOperators = [
    'untagged', 'disowned'
];

export function SearchInput({
    value,
    onChange
}: {
    value: string[],
    onChange: (_: any, val: string[]) => void
}) {
    const [prefix, setPrefix] = useState('');
    const { data, isLoading } = useTags(startsWith(prefix, ['+', '-']) ? _.trimStart(prefix, '+-') : null);

    return (
        <Autocomplete
            multiple
            freeSolo
            value={value}
            fullWidth
            options={data?.data.map(val => val.name) ?? []}
            getOptionDisabled={() => isLoading}
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={index} />
                ))
            }
            renderOption={(props, option, { inputValue }) => {
                const { key, ...optionProps } = props;
                const matches = match(option, inputValue);
                const parts = parse(option, matches);

                return (
                    <li key={key} {...optionProps}>
                        <div>
                            {parts.map((part, index) => (
                                <span
                                    key={index}
                                    style={{
                                        fontWeight: part.highlight ? 700 : 400,
                                    }}>
                                    {part.text}
                                </span>
                            ))}
                        </div>
                    </li>
                );
            }}
            filterOptions={(options, { inputValue }) => {
                if (inputValue.startsWith('+') || inputValue.startsWith('-')) {
                    return options
                        .filter(x => x.startsWith(_.trimStart(inputValue, '+-')))
                        .map(x => inputValue[0] + x);
                }
                else if (inputValue.indexOf(':') != -1) {
                    const [selector, value] = inputValue.split(':');
                    if (selector == 'rating' || selector == 'r') {
                        return ratingValues
                            .filter(x => x.startsWith(value))
                            .map(val => selector + ':' + val);
                    }
                    else if (selector == 'system' || selector == 'sys') {
                        return sysOperators
                            .filter(x => x.startsWith(value))
                            .map(val => selector + ':' + val);
                    }
                }
                return [];
            }}
            onChange={onChange}
            renderInput={
                (params) => (
                    <TextField
                        {...params}
                        sx={{ m: '16px 0 16px 0' }}
                        label="Search"
                        variant="outlined"
                        value={prefix}
                        onChange={(e) => {
                            setPrefix(e.target.value);
                        }}
                        slotProps={{
                            input: {
                                ...params.InputProps,
                                endAdornment: isLoading ? <CircularProgress size={20} /> : <></>
                            }
                        }} />
                )
            }
            
        />
    )
}

export function QueryReference() {
    const rows = [
        {
            name: '+tag',
            description: 'Search for posts tagged with $tag'
        },
        {
            name: '-tag',
            description: 'Exclude posts tagged with $tag from result'
        },
        {
            name: 'rating:value',
            description: 'Search for posts with rating equal to $value. Initial abbreviations are allowed'
        },
        {
            name: 'r:value',
            description: 'Alias for rating:value'
        },
        {
            name: 'id:value',
            description: 'Search for posts with ids containing $value'
        },
        {
            name: 'uploader:value',
            description: 'Search for posts uploaded by the user named $value'
        },
        {
            name: 'up:value',
            description: 'Alias for uploader:value'
        },
        {
            name: 'system:value',
            description: 'Refer to documents for details'
        },
        {
            name: 'sys:value',
            description: 'Alias for system:value'
        }
    ]
    return (
        <Grid container>
            <Grid size={{ xs: 12, md: 8 }} offset={{ md: 2 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                    Query Reference
                </Typography>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: '20px' }}>Selector</TableCell>
                                <TableCell sx={{ fontSize: '20px' }}>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={row.name}
                                    className="font-mono"
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 }
                                    }}>
                                    <TableCell
                                        sx={{ fontFamily: 'monospace' }}
                                        component="th" scope="row">
                                        {row.name}
                                    </TableCell>
                                    <TableCell>{row.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    )
}
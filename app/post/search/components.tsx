'use client';

import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import _ from 'lodash';

import TagIcon from '@mui/icons-material/Tag';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

import { useTags } from '@/app/context';

export function SearchInput({
    value,
    onChange
}: {
    value: string[],
    onChange: (_: any, val: string[]) => void
}) {
    const { data, isLoading } = useTags();

    return (
        <Autocomplete
            multiple
            freeSolo
            value={value}
            fullWidth
            sx={{ mt: 2 }}
            options={data?.map(val => val.name) ?? []}
            renderTags={(value: string[], getTagProps) =>
                value.map((option: string, index: number) => (
                    <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={index} />
                ))
            }
            renderOption={(props, option) => {
                return <li {...props} key={option}>{option}</li>;
            }}
            filterOptions={(options, { inputValue }) => {
                if (inputValue.startsWith('+') || inputValue.startsWith('-')) {
                    return options
                        .filter(x => x.startsWith(_.trimStart(inputValue, '+-')))
                        .map(x => inputValue[0] + x);
                }
                else {
                    return [];
                }
            }}
            onChange={onChange}
            renderInput={
                (params) => (
                    <TextField
                        {...params}
                        sx={{ m: '16px 0 16px 0' }}
                        label="Search"
                        variant="outlined"
                        slotProps={{
                            input: {
                                ...params.InputProps,
                                endAdornment: isLoading ? <CircularProgress size={20} /> : <></>
                            }
                        }}/>
                )
            }
        />
    )
}
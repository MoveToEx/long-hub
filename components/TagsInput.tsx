'use client';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

import { useState } from 'react';
import _ from 'lodash';
import { useTags } from '@/app/context';

export function TagsInput({
    value,
    onChange,
}: {
    value: string[]
    onChange: (value: string[]) => void,
}) {
    const [prefix, setPrefix] = useState('');
    const { data, isLoading } = useTags(prefix);

    return (
        <Autocomplete
            multiple
            freeSolo
            value={value}
            fullWidth
            getOptionDisabled={() => isLoading}
            options={data?.data.map(val => val.name) || []}
            onChange={(__, newValue) => {
                if (newValue.length == 0 || /^[a-z0-9_]+$/.test(_.last(newValue) ?? '')) {
                    onChange(newValue);
                }
            }}
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
            renderTags={(value, getTagProps) =>
                value.map((option: string, index: number) => (
                    <Chip {...getTagProps({ index })} variant="outlined" label={option} key={index} />
                ))
            }
            renderInput={
                (params) => (
                    <TextField
                        {...params}
                        label="Tags"
                        error={!/^[a-z0-9_]*$/.test(params.inputProps.value?.toString() ?? '')}
                        helperText={"Only lower case, digits and underline are allowed in tags"}
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
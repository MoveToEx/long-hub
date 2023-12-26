'use client';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { createQueryString } from '@/lib/util';
import { Base64 } from 'js-base64';
import _ from 'lodash';
import TagIcon from '@mui/icons-material/Tag';
import LabelIcon from '@mui/icons-material/Label';
import PercentIcon from '@mui/icons-material/Percent';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

function getLabel(s: string) {
    if (s.startsWith('+') || s.startsWith('-')) {
        return {
            label: _.trimStart(s, '+'),
            avatar: <TagIcon />
        };
    }
    else if (s.startsWith('@')) {
        return {
            label: _.trimStart(s, '@'),
            avatar: <FingerprintIcon />
        };
    }
    else if (s.startsWith('<') || s.startsWith('>') || s.startsWith('=') || s.startsWith('!=')) {
        return {
            label: _.trimStart(s, '<>!='),
            avatar: <PercentIcon />
        }
    }
    else {
        return {
            label: s,
            avatar: <LabelIcon />
        }
    }
}

export function SearchInput({
    value,
    tags
}: {
    value: string[],
    tags: string[]
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    return (
        <>
            <Autocomplete
                multiple
                freeSolo
                defaultValue={value}
                fullWidth
                sx={{ mt: 2 }}
                options={tags}
                renderTags={(value: string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                        <Chip
                            variant="outlined"
                            {...getLabel(option)}
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
                onChange={(_, newValue) => {
                    router.push(createQueryString(pathname, {
                        ...searchParams.entries(),
                        's': Base64.encodeURI(JSON.stringify(newValue))
                    }));
                }}
                renderInput={
                    (params) => (
                        <TextField
                            {...params}
                            sx={{ m: '16px 0 16px 0' }}
                            placeholder="Selector"
                            label="Search"
                            variant="outlined" />
                    )
                }
            />
        </>
    )
}
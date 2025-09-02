'use client';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import RatingComponent from '@/components/Rating';
import RatingIcon from '@/components/RatingIcon';
import { TagsInput } from '@/components/TagsInput';
import { Rating } from '@prisma/client';
import _ from 'lodash';

type Metadata = {
    text: string,
    tags: string[],
    rating: Rating
};

export default function MetadataForm({
    value,
    reducer
}: {
    value: Metadata,
    reducer: <T extends keyof Metadata>(key: T, value: Metadata[T]) => void
}) {

    return (
        <Stack spacing={2} className='items-center w-full' sx={{ mb: 2 }}>
            <TextField
                label="Text"
                name="text"
                fullWidth
                value={value.text}
                onChange={e => {
                    reducer('text', e.target.value);
                }}
            />
            <TagsInput
                value={value.tags}
                onChange={v => reducer('tags', v)} />
            <Box alignItems="center" sx={{ width: '100%', display: 'flex' }}>
                <Tooltip title="Rating">
                    <RatingIcon />
                </Tooltip>
                <RatingComponent
                    value={value.rating}
                    onChange={(_, newValue) => reducer('rating', newValue)} />
                <Box sx={{ ml: 1 }}>
                    {_.upperFirst(value.rating)}
                </Box>
            </Box>
        </Stack>
    )
}
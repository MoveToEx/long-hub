import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Link from 'next/link';
import TagIcon from '@mui/icons-material/Tag';

function TagRow({
    tags,
    noicon = false
}: {
    tags: (string | null)[],
    noicon?: boolean
}) {
    return (
        <Stack spacing={1} direction="row" display="inline">
            {tags.length == 0
                ? <i> Untagged </i>
                : tags.map((e, i) => (
                    <Chip
                        component={Link}
                        href={'/tag/' + e}
                        key={i}
                        label={e}
                        sx={{ fontSize: '16px' }}
                        icon={noicon ? <></> : <TagIcon />}
                        onClick={() => { }}
                    />
                ))
            }
        </Stack>
    )
}

export default TagRow;
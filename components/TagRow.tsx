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
    if (tags.length == 0) {
        return <i>Untagged</i>;
    }
    return (
        <Stack direction="row" display="inline-block" useFlexGap>
            {tags.map(e => (
                <Chip
                    component={Link}
                    href={'/tag/' + e}
                    key={e}
                    label={e}
                    sx={{ fontSize: '16px', m: .5 }}
                    icon={noicon ? undefined : <TagIcon />}
                    onClick={() => { }}
                />
            ))}
        </Stack>
    )
}

export default TagRow;
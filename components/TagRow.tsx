import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Link from 'next/link';
import TagIcon from '@mui/icons-material/Tag';

function TagRow({
    tags
}: {
    tags: (string | null)[]
}) {
    return (
        <Stack spacing={1} direction="row" display="inline">
            {tags.length == 0
                ? <i> Untagged </i>
                : tags.map((e, i) => (
                    <Link href={'/tag/' + e} key={i}>
                        <Chip label={e} sx={{ fontSize: '16px' }} icon={<TagIcon />} />
                    </Link>
                ))
            }
        </Stack>
    )
}

export default TagRow;
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import TagIcon from '@mui/icons-material/Tag';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { Tag } from '@/lib/db';

export default async function Tags() {
    const tags = await Tag.findAll();

    return (
        <Box sx={{ mt: '12px' }}>
            {
                tags.map(tag => (
                    <Badge
                        badgeContent={tag.countPosts()}
                        key={tag.name}
                        color={(tag.description && tag.type && tag.summary) ? "primary" : "secondary"}
                        sx={{ m: 1 }}>
                        <Link href={"/tag/" + tag.name}>
                            <Chip
                                label={<Typography>{tag.name}</Typography>}
                                icon={<TagIcon />}
                                title={(tag.type ?? 'Uncategorized') + ' | ' + (tag.summary ?? 'No summary available')} />
                        </Link>
                    </Badge>
                ))
            }
        </Box>
    )
}
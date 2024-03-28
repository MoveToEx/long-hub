import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import TagIcon from '@mui/icons-material/Tag';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Tag'
};

export default async function Tags() {
    const tags = await prisma.tag.findMany({
        select: {
            _count: {
                select: {
                    posts: true
                }
            },
            name: true
        }
    });

    return (
        <Box sx={{ mt: '12px' }}>
            {
                tags.map(tag => (
                    <Badge
                        badgeContent={tag._count.posts}
                        key={tag.name}
                        color="primary"
                        sx={{
                            m: 1
                        }}>
                        <Link href={"/tag/" + tag.name} prefetch={false}>
                            <Chip label={<Typography>{tag.name}</Typography>} icon={<TagIcon />} />
                        </Link>
                    </Badge>
                ))
            }
        </Box>
    )
}
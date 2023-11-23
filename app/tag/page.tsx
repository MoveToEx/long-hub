import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import TagIcon from '@mui/icons-material/Tag';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';

export default async function Tags() {
    const tags = await fetch(process.env.NEXT_PUBLIC_BACKEND_HOST + '/tag/').then(async x => await x.json());

    return (
        <Box sx={{marginTop: '12px'}}>
            {
                tags.map((e: any) => (
                    <Badge badgeContent={e.count} key={e.name} color="primary" style={{
                        margin: "6px"
                    }}>
                        <Link href={"/tag/" + e.name} prefetch={false}>
                            <Chip label={<Typography>{e.name}</Typography>} icon={<TagIcon />} />
                        </Link>
                    </Badge>
                ))
            }
        </Box>
    )
}
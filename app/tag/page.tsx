'use client';

import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import TagIcon from '@mui/icons-material/Tag';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Tags() {
    const [tags, setTags] = useState<any[]>([]);

    useEffect(() => {
        axios.get('/api/tag')
            .then(x => setTags(x.data));
    }, []);

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
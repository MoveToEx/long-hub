'use client';

import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import TagIcon from '@mui/icons-material/Tag';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { TagsResponse } from '@/lib/types/TagResponse';

export default function Tags() {
    const [tags, setTags] = useState<TagsResponse>([]);

    useEffect(() => {
        axios.get('/api/tag')
            .then(x => setTags(x.data));
    }, []);

    return (
        <Box sx={{marginTop: '12px'}}>
            {
                tags.map(tag => (
                    <Badge badgeContent={tag.count} key={tag.name} color="primary" style={{
                        margin: "6px"
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
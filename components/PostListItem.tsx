import _ from 'lodash';
import Grid from '@mui/material/Grid2';
import Link from 'next/link';
import Image, { ImageProps } from 'next/image';
import Typography from '@mui/material/Typography';
import { preload } from 'swr';
import { PostFetcher } from '@/app/context';
import Stack from '@mui/material/Stack';
import CopiableText from '@/components/CopiableText';
import TagRow from '@/components/TagRow';

type PostGridProps = {
    value: {
        id: string;
        imageURL: string;
        text?: string;
        tags: { name: string }[];
    },
    ImageProps?: Omit<ImageProps, 'src' | 'alt'>,
    prefetch?: boolean
};

export default function PostGrid({
    value,
    ImageProps,
    prefetch = true
}: PostGridProps) {
    return (
        <Grid container spacing={1} onMouseOver={prefetch ? () => {
            preload('/api/post/' + value.id, PostFetcher);
        } : undefined}>
            <Grid size={4}>
                <Link href={`/post/${value.id}`} style={{ maxWidth: '100%' }}>
                    <Image
                        src={value.imageURL}
                        alt={value.id}
                        height={150}
                        width={150}
                        unoptimized
                        loading="eager"
                        style={{
                            maxWidth: '100%',
                            minHeight: '150px',
                            objectFit: 'contain',
                        }}
                        {...ImageProps}
                    />
                </Link>
            </Grid>
            <Grid size="grow">
                <Stack spacing={1} justifyItems="center">
                    <CopiableText text={value.id} />
                    <Typography>{value.text ?? <i>No text</i>}</Typography>
                    <TagRow tags={value.tags.map(e => e.name)} />
                </Stack>
            </Grid>
        </Grid>
    )
}
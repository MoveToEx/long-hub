import Image from 'next/image';
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'next/link';
import Skeleton from '@mui/material/Skeleton';
import _, { Falsey } from 'lodash';

interface LinkImage {
    href: string;
    src: string;
}

export default function LinkImageGrid({
    src,
    gridProps,
    gridContainerProps,
    linkProps
}: {
    src: LinkImage[],
    gridProps?: any,
    gridContainerProps?: any,
    linkProps?: any
}) {
    var elem = src.map((e, i) => (
        <Grid {...gridProps} key={i}>
            <Link {...linkProps} href={e.href} key={e.href}>
                <Image
                    src={e.src}
                    alt={e.src}
                    height={300}
                    width={300}
                    style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '300px',
                        margin: 'auto',
                        objectFit: 'contain'
                    }}
                />
            </Link>
        </Grid>
    ));
    
    return (
        <Grid {...gridContainerProps} container>
            {elem}
        </Grid>
    );
}

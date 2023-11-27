import Image from 'next/image';
import Grid from '@mui/material/Unstable_Grid2';
import Link from 'next/link';
import Skeleton from '@mui/material/Skeleton';
import _ from 'lodash';

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
    src: LinkImage[] | null,
    gridProps?: any,
    gridContainerProps?: any,
    linkProps?: any
}) {
    var elem;
    if (src === null || _.isEmpty(src)) {
        elem = _.range(24).map(() => (
            <>
                <Skeleton variant="rectangular" height={300} />
            </>
        ))
    }
    else {
        elem = src.map((e: LinkImage) => (
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
        ))
    }
    return (
        <Grid {...gridContainerProps} container>
            {
                elem.map((e: any, i: number) => (
                    <Grid {...gridProps} key={i}>
                        {e}
                    </Grid>
                ))
            }
        </Grid>
    );
}

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
    skeletonHeight,
    gridProps,
    gridContainerProps,
    linkProps
}: {
    src: LinkImage[] | null,
    skeletonHeight: number,
    gridProps?: any,
    gridContainerProps?: any,
    linkProps?: any
}) {
    var elem;
    if (src === null) {
        return <></>;
    }
    else if (_.isEmpty(src)) {
        elem = _.range(24).map(() => (
            <>
                <Skeleton variant="rectangular" height={skeletonHeight} />
                <Skeleton variant="text" height={24} />
                <Skeleton variant="text" height={24} />
            </>
        ))
    }
    else {
        elem = src.map((e: LinkImage) => (
            <Link {...linkProps} href={e.href} key={e.href} prefetch={false}>
                <Image
                    src={e.src}
                    alt={e.src}
                    height={0}
                    width={0}
                    sizes='100vw'
                    style={{
                        width: '100%',
                        height: '300px',
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

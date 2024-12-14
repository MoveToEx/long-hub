import icon from '@/public/rating.png';
import useMediaQuery from '@mui/material/useMediaQuery';
import Image from 'next/image';

export default function RatingIcon() {
    const darkMode = useMediaQuery('(prefers-color-scheme: dark)');
    return (
        <Image
            className={darkMode ? 'invert' : ''}
            src={icon}
            alt='Rating'
            width={24}
            height={24}
            style={{
                margin: '4px 8px 4px 8px'
            }}/>
    );
}
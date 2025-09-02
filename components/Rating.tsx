import MUIRating, { IconContainerProps, RatingProps as MUIRatingProps } from '@mui/material/Rating';
import { styled } from '@mui/material/styles';
import { Rating } from '@prisma/client';
import { ReverseRatingsMapping, RatingsMapping } from '@/lib/constants';
import SquareIcon from '@mui/icons-material/Square';
import { SyntheticEvent } from 'react';

const StyledRating = styled(MUIRating)(({ theme }) => ({
    '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
        color: theme.palette.action.disabled,
    },
}));

type RatingProps = Omit<MUIRatingProps, 'value' | 'onChange'> & {
    value: keyof typeof Rating,
    onChange?: (event: SyntheticEvent, value: keyof typeof Rating) => void
};

const ratingColors: {
    [index: number]: 'success' | 'warning' | 'error'
} = {
    1: 'success',
    2: 'warning',
    3: 'error'
};

function IconContainer(props: IconContainerProps) {
    const { value, ...other } = props;
    return (
        <span {...other}>
            <SquareIcon color={ratingColors[value]} sx={{ m: 0, p: 0 }} />
        </span>
    )
}

export default function RatingComponent({
    value,
    onChange, 
    ...other
}: RatingProps) {
    return (
        <StyledRating
            value={ReverseRatingsMapping[value]}
            max={3}
            highlightSelectedOnly
            onChange={(event, value) => {
                onChange?.(event, value !== null ? RatingsMapping[value - 1] : RatingsMapping[0]);
            }}
            slotProps={{
                icon: {
                    component: IconContainer
                }
            }}
            {...other} />
    )
}
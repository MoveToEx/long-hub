'use client';

import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";

export default function CopiableText({
    text,
    maxLength
}: {
    text: string,
    maxLength?: number
}) {
    const { enqueueSnackbar } = useSnackbar();

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            enqueueSnackbar('Copied to clipboard', { variant: 'success' });
        }
        catch (e) {
            enqueueSnackbar('Failed: ' + e, { variant: 'error' });
        }
    }
    return (
        <Typography onClick={copy} className="cursor-pointer select-none" component="pre" noWrap>
            {
                (maxLength && text.length > maxLength) ? text.slice(0, maxLength) + '...' : text
            }
        </Typography>
    )
}
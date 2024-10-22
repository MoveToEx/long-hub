'use client';

import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";
import styles from './components.module.css';

export default function CopiableText({
    text,
    maxLength,
    displayText
}: {
    text: string,
    maxLength?: number,
    displayText?: string,
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
        <Typography onClick={copy} className={styles.copiable} component="pre" noWrap>
            {
                displayText === undefined ?
                    (maxLength && text.length > maxLength ? text.slice(0, maxLength) + '...' : text) :
                    displayText
            }
        </Typography>
    )
}
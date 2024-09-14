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

    const copy = () => {
        navigator.clipboard.writeText(text)
            .then(() => {
                enqueueSnackbar('Copied to clipboard', { variant: 'success' });
            });
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
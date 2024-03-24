'use client';

import Typography from "@mui/material/Typography";

import { useSnackbar } from "notistack";

import styles from './page.module.css';

export function TruncatedCopiableText({ text, maxLength }: { text: string, maxLength: number }) {
    const { enqueueSnackbar } = useSnackbar();

    const copy = () => {
        navigator.clipboard.writeText(text)
            .then(() => {
                enqueueSnackbar('Copied to clipboard', { variant: 'success' });
            });
    }
    return (
        <Typography onClick={copy} className={styles.copiable} component="pre">
            {text.length > maxLength ? text.slice(0, maxLength) + '...' : text}
        </Typography>
    )
}
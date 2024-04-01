'use client';

import Typography from "@mui/material/Typography";

import { useSnackbar } from "notistack";

import styles from './components.module.css';

export default function CopiableText({ text, maxLength }: { text: string, maxLength?: number | undefined }) {
    const { enqueueSnackbar } = useSnackbar();

    const copy = () => {
        navigator.clipboard.writeText(text)
            .then(() => {
                enqueueSnackbar('Copied to clipboard', { variant: 'success' });
            });
    }
    return (
        <Typography onClick={copy} className={styles.copiable} component="pre">
            {maxLength && text.length > maxLength ? text.slice(0, maxLength) + '...' : text}
        </Typography>
    )
}
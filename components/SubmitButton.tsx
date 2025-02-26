'use client';

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import Button from '@mui/material/Button';


export default function SubmitButton({
    label
}: {
    label: ReactNode
}) {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            fullWidth
            disabled={pending}
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
        >
            {label}
        </Button>
    )
}
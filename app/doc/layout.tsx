import { ReactNode } from "react";
import { Metadata } from "next";
import Container from '@mui/material/Container';

export const metadata: Metadata = {
    title: 'Document'
}

export default async function Template({
    children
}: {
    children: ReactNode
}) {
    return (
        <Container>
            {children}
        </Container>
    );
}
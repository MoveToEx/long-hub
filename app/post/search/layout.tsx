import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Search"
};

export default async function SearchLayout({
    children
}: {
    children: ReactNode
}) {
    return (
        <>
            {children}
        </>
    )
}
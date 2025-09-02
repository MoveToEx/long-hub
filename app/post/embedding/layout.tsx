import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Embedding Search"
};

export default async function SearchLayout({
    children
}: {
    children: ReactNode
}) {
    return (
        <div className='flex flex-col self-start justify-center w-full'>
            {children}
        </div>
    )
}
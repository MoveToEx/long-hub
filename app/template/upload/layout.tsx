import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: 'Upload template'
};

export default function Layout({
    children
}: {
    children: ReactNode
}) {
    return children;
}
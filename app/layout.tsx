import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import * as React from 'react';

export const metadata: Metadata = {
	title: 'Index | LONG Hub',
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<meta name="viewport" content="initial-scale=1, width=device-width" />
			</head>
			<body className={inter.className}>
				{children}
			</body>
		</html>
	)
}

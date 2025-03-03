import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import * as React from 'react';
import UI from './ui';

export const metadata: Metadata = {
	title: {
		absolute: 'LONG Hub',
		template: '%s | LONG Hub'
	},
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
	children,
	modal,
}: {
	children: React.ReactNode,
	modal: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<meta name="viewport" content="initial-scale=1, width=device-width" />
			</head>
			<body className={inter.className}>
				<UI>
					{children}
					{modal}
				</UI>
			</body>
		</html>
	)
}

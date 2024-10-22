/** @type {import('next').NextConfig} */

export const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['longhub.top', 'www.longhub.top', 'localhost', 'nextjs'],
        },
    },
    pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.longhub.top',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3042',
                pathname: '/**'
            },
            {
                protocol: 'http',
                hostname: '192.168.110.16',
                port: '3042',
                pathname: '/**'
            },
        ]
    },
};

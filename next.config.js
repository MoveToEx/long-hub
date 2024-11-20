/** @type {import('next').NextConfig} */

const nextConfig = {
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
                hostname: '*.longhub.top',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: '*.r2.dev',
                pathname: '/**'
            }
        ]
    },
};

export default nextConfig;
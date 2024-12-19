/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['longhub.top', '*.longhub.top', 'localhost']
        },
    },
    pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

export default nextConfig;
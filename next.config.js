/** @type {import('next').NextConfig} */

const withMDX = require('@next/mdx')();
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE == 'true'
});

const nextConfig = {
    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
    ) => {
        if (!isServer) {
            config.resolve.fallback = {
                child_process: false
            };
        }
        return config;
    },
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
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
        ]
    },
};

module.exports = withBundleAnalyzer(withMDX(nextConfig));

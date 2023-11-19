/** @type {import('next').NextConfig} */

const withMDX = require('@next/mdx')()

const nextConfig = {
    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
    ) => {
        config.externals = [
            ...(config.externals ?? []),
            'sequelize'
        ]
        return config
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
            }
        ]
    },
};

module.exports = withMDX(nextConfig);

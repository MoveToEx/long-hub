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
        domains: ["https://img.longhub.top"]
    },
};

module.exports = withMDX(nextConfig);

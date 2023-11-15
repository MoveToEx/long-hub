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
}

module.exports = withMDX(nextConfig);

/** @type {import('next').NextConfig} */

const withMDX = require('@next/mdx')();
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE == 'true'
});
const commitHash = require('child_process').execSync('git rev-parse --short HEAD').toString().trim();

const nextConfig = {
    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
    ) => {
        config.externals = [
            ...(config.externals ?? []),
            'sequelize'
        ];
        if (!isServer) {
            config.resolve.fallback = {
                child_process: false
            };
        }
        return config;
    },
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
    env: {
        GIT_COMMIT: commitHash
    },
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

module.exports = withBundleAnalyzer(withMDX(nextConfig));

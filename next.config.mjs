/** @type {import('next').NextConfig} */

import rehypeHighlight from 'rehype-highlight';
import json from 'highlight.js/lib/languages/json';
import http from 'highlight.js/lib/languages/http';
import nextMDX from '@next/mdx';
import { execSync } from  'child_process';
var commitHash = execSync('git rev-parse --short HEAD').toString().trim();

if (execSync('git status -s').toString().trim().length != 0) {
    commitHash = commitHash + '*';
}

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

const withMDX = nextMDX({
    options: {
        rehypePlugins: [
            [
                rehypeHighlight,
                {
                    languages: {
                        json: json,
                        http: http
                    }
                }
            ]
        ]
    }
});

export default withMDX(nextConfig);

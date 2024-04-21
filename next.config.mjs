import rehypeHighlight from 'rehype-highlight';
import json from 'highlight.js/lib/languages/json';
import http from 'highlight.js/lib/languages/http';
import nextMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['longhub.top', 'www.longhub.top', 'localhost', 'nextjs'],
        },
    },
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
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

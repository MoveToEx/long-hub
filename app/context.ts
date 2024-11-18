import useSWR from 'swr';
import _ from 'lodash';
import { Prisma } from '@prisma/client';
import { prisma } from "@/lib/db";

type ReplaceByValue<T, U, V> = {
    [K in keyof T]: T[K] extends U ? V : T[K];
};

type User = NonNullable<ReplaceByValue<Prisma.Result<typeof prisma.user, {}, 'findFirst'>, Date, String>>;

type Tag = NonNullable<Prisma.Result<typeof prisma.tag, {}, 'findFirst'>>;

type Tags = (Tag & {
    count: number
})[];

type Post = NonNullable<ReplaceByValue<Prisma.Result<typeof prisma.post, {
    include: {
        tags: true,
        uploader: {
            select: {
                id: true,
                name: true
            }
        }
    },
}, 'findFirst'>, Date, string>>;

type PostsResponse = {
    count: number;
    data: Post[];
};

function parseRating(s: string) {
    if (s == 'n') return 'none';
    else if (s == 'm') return 'moderate';
    else if (s == 'v') return 'violent';
    return s;
}

function startsWith(s: string, ch: string[]) {
    return ch.map(val => s.startsWith(val)).reduce((x, y) => x || y);
}

function parseFilter(params: string[]) {
    return params.map(s => {
        if (startsWith(s, ['+', '-'])) {
            return {
                type: 'tag',
                op: s.startsWith('+') ? 'include' : 'exclude',
                value: _.trimStart(s, '+-')
            }
        }
        const [field, value] = s.split(':', 2);
        if (field == 'rating' || field == 'r') {
            return {
                type: 'rating',
                value: parseRating(value)
            }
        }
        else if (field == 'uploader') {
            return {
                type: 'uploader',
                op: 'is',
                value
            }
        }
        else {
            return {
                type: 'text',
                op: 'contains',
                value: s
            }
        }
    });
}

const fetcher = async (url: string) => {
    const response = await fetch(url);
    
    if (!response.ok) {
        return undefined;
    }
    
    return response.json();
}

const throwableFetcher = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}

export const UserFetcher = fetcher;
export const useUser = () => useSWR<User | undefined>('/api/account', UserFetcher);

export const TagsFetcher = fetcher;
export const useTags = () => useSWR<Tags>('/api/post/tag', TagsFetcher);

export const PostsFetcher = throwableFetcher;
export function usePosts(page: number = 0) {
    return useSWR<PostsResponse>('/api/post?limit=24&offset=' + 24 * (page - 1), PostsFetcher);
}

export const PostFetcher = throwableFetcher;
export const usePost = (id: string) => useSWR<Post>('/api/post/' + id, PostFetcher);

export const TaggedPostsFetcher = throwableFetcher;
export function useTaggedPost(tag: string, page: number) {
    return useSWR<PostsResponse>('/api/post/tag/' + tag + '?limit=24&offset=' + (page - 1) * 24, TaggedPostsFetcher);
}

// export const SearchResultFetcher = throwableFetcher;
export const SearchResultFetcher = async ([keyword, page]: [string[], number]) => {
    if (keyword.length == 0) {
        return {
            count: 0,
            data: []
        };
    }

    const data = JSON.stringify(parseFilter(keyword));
    const response = await fetch('/api/post/search?limit=24&offset=' + (page - 1) * 24, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}
export function useSearchResult({ keyword, page }: { keyword: string[], page: number }) {
    return useSWR<PostsResponse>([keyword, page], SearchResultFetcher, {});
}
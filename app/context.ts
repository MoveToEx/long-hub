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

export function useUser() {
    const fetcher = async (url: string) => {
        const response = await fetch(url);

        if (!response.ok) {
            return undefined;
        }

        return response.json();
    };

    return useSWR<User | undefined>('/api/account', fetcher);
}

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
        if (field == 'rating') {
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

export const TagsFetcher = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
        return null;
    }

    return response.json();
};
export const useTags = () => useSWR<Tags>('/api/post/tag', TagsFetcher);

export const PostsFetcher = async ({ offset, limit }: { offset: number, limit: number }) => {
    const response = await fetch('/api/post?limit=' + limit + '&offset=' + offset);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
};
export const usePosts = (offset: number = 0, limit: number = 24) => useSWR<PostsResponse>({ offset, limit }, PostsFetcher, {});

export const PostFetcher = async (id: string) => {
    const response = await fetch('/api/post/' + id);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
};
export const usePost = (id: string) => useSWR<Post>(id, PostFetcher);

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

    return response.json();
}
export function useSearchResult({ keyword, page }: { keyword: string[], page: number }) {
    return useSWR<PostsResponse>([keyword, page], SearchResultFetcher, {});
}

export const TaggedPostsFetcher = async ([tag, page]: [string, number]) => {
    const response = await fetch('/api/post/tag/' + tag + '?limit=24&offset=' + (page - 1) * 24);

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}
export const useTaggedPost = (tag: string, page: number) => useSWR<PostsResponse>([tag, page], TaggedPostsFetcher, {});
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
export function usePosts(limit: number = 24, offset: number = 0) {
    return useSWR<PostsResponse>(`/api/post?limit=${limit}&offset=${offset}`, PostsFetcher);
}

export const PostFetcher = throwableFetcher;
export const usePost = (id: string) => useSWR<Post>('/api/post/' + id, PostFetcher);

export const TaggedPostsFetcher = throwableFetcher;
export function useTaggedPost(tag: string, page: number) {
    return useSWR<PostsResponse>('/api/post/tag/' + tag + '?limit=24&offset=' + (page - 1) * 24, TaggedPostsFetcher);
}

export type SearchQuery = {
    filter: {
        type: string,
        op: string | undefined,
        value: string
    }[],
    order?: {
        key: string,
        direction: 'asc' | 'desc'
    } | undefined,
    page?: number | undefined
}

// export const SearchResultFetcher = throwableFetcher;
export const SearchResultFetcher = async ({ filter, order, page }: SearchQuery) => {
    if (filter.length == 0) {
        return {
            count: 0,
            data: []
        };
    }

    const data = JSON.stringify({
        filter,
        order: order ? [order] : undefined
    });
    const response = await fetch('/api/post/search?limit=24&offset=' + ((page ?? 1) - 1) * 24, {
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
export function useSearchResult(query: SearchQuery | null) {
    return useSWR<PostsResponse>(query, SearchResultFetcher, {});
}
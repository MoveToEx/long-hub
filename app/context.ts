import useSWR from 'swr';
import _ from 'lodash';
import { Prisma } from '@/lib/schema';
import { prisma } from '@/lib/db';
import type * as U from '@/lib/types';

type NonSerializable = Date;

type Serialized<T> = T extends NonSerializable ? string : (
    T extends (infer U)[] ? SerializedArray<U> : (
        T extends object ? SerializedObject<T> : T
    )
);

type SerializedArray<T> = T extends NonSerializable ? string[] : (
    T extends object ? SerializedObject<T>[] : T[]
);

type SerializedObject<T> = {
    [K in keyof T]: Serialized<T[K]>
};

type Self = Serialized<U.Self>;
type User = Serialized<U.User>;
type Tag = U.Tag;

type Tags = {
    count: number,
    data: (Tag & {
        count: number
    })[]
};

type Post = NonNullable<Serialized<Prisma.Result<typeof prisma.post, {
    include: {
        tags: true,
        uploader: {
            select: {
                id: true,
                name: true
            }
        },
        deletion_requests: {
            include: {
                user: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            }
        }
    },
}, 'findFirst'>>>;

type PostsResponse = {
    count: number;
    data: NonNullable<Serialized<Prisma.Result<typeof prisma.post, {
        include: {
            tags: true,
            uploader: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
    }, 'findFirst'>>>[];
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

export const SessionFetcher = fetcher;
export const useSession = () => useSWR<Self | undefined>('/api/auth', SessionFetcher);

export const UserFetcher = fetcher;
export const useUser = (id: number) => useSWR<User>(`/api/user/${id}`, UserFetcher);

export const TagsFetcher = fetcher;
export const useTags = (prefix?: string | null) => {
    return useSWR<Tags>('/api/post/tag?prefix=' + (prefix ?? ''), TagsFetcher, {
        keepPreviousData: true
    });
}

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

export const SearchResultFetcher = async ({ filter, order, page }: SearchQuery) => {
    if (filter.length == 0) {
        return {
            count: 0,
            data: []
        };
    }

    const data = JSON.stringify({
        filter,
        order: order ? [order] : undefined,
        deleted: false
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
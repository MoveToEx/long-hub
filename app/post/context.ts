import useSWR, { Fetcher } from 'swr';
import _ from 'lodash';


interface Tag {
    id: number;
    name: string;
};

interface Post {
    id: string;
    text: string;
    aggr: number;
    tags: Tag[];
    image: string;
    imageURL: string;
    imageHash: string;
    createdAt: string;
    updatedAt: Date;
    uploaderId?: number;
    uploader?: {
        name: string;
    }
};

interface PostsResponse {
    count: number;
    data: Post[];
};

function parseOp(s: string) {
    if (s.startsWith('=')) return 'eq';
    else if (s.startsWith('!=')) return 'ne';
    else if (s.startsWith('>=')) return 'gte';
    else if (s.startsWith('>')) return 'gt';
    else if (s.startsWith('<=')) return 'lte';
    else if (s.startsWith('<')) return 'lt';
    else throw new Error('unknown operator');
}

function startsWith(s: string, ch: string[]) {
    return ch.map(val => s.startsWith(val)).reduce((x, y) => x || y);
}

function parseFilter(kw: string[]) {
    return kw.map(x => {
        if (startsWith(x, ['+', '-'])) {
            return {
                type: 'tag',
                op: x.startsWith('+') ? 'include' : 'exclude',
                value: _.trimStart(x, '+-')
            }
        }
        else if (startsWith(x, ['>', '<', '!', '='])) {
            return {
                type: 'aggr',
                op: parseOp(x),
                value: Number(_.trimStart(x, '<=>!'))
            }
        }
        else if (x.startsWith('@')) {
            return {
                type: 'id',
                value: _.trimStart(x, '@')
            }
        }
        else {
            return {
                type: 'text',
                value: x
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

export const useTags = () => useSWR<(Tag & { count: number })[]>('/api/post/tag', TagsFetcher);

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

export function useSearchResult({ keyword, page }: { keyword: string[], page: number }) {
    const fetcher = async ([keyword, page]: [string[], number]) => {
        if (keyword.length == 0) return {
            count: 0,
            data: []
        };

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

    return useSWR<PostsResponse>([keyword, page], fetcher, {});
}
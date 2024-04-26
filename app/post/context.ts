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
    createdAt: Date;
    updatedAt: Date;
    uploaderId?: number;
};

interface PostResponse {
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

export function useTag() {
    const fetcher = async (url: string) => {
        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        return response.json();
    };

    return useSWR<(Tag & { count: number })[]>('/api/post/tag', fetcher);
}

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

    return useSWR<PostResponse>([keyword, page], fetcher, {});
    // return useSWR<PostResponse>([keyword, page], fetcher);
}
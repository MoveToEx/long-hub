import _ from 'lodash';
import { SearchQuery } from '@/app/context';
import { startsWith } from '@/lib/util';

export function parseRating(s: string) {
    if (s == 'n') return 'none';
    else if (s == 'm') return 'moderate';
    else if (s == 'v') return 'violent';
    return s;
}

export function parseFilter(params: string[]) {
    return params.map(s => {
        if (startsWith(s, ['+', '-'])) {
            return {
                type: 'tag',
                op: s.startsWith('+') ? 'include' : 'exclude',
                value: _.trimStart(s, '+-')
            }
        }
        if (s.indexOf(':') === -1) {
            return {
                type: 'text',
                op: 'contains',
                value: s
            }
        }
        const [field, value] = s.split(':', 2);
        if (field == 'rating' || field == 'r') {
            return {
                type: 'rating',
                value: parseRating(value)
            }
        }
        else if (field == 'uploader' || field == 'up') {
            return {
                type: 'uploader',
                op: 'is',
                value
            }
        }
        else if (field == 'id') {
            return {
                type: 'id',
                op: 'contains',
                value
            }
        }
        else if (field == 'system' || field == 'sys') {
            return {
                type: 'system',
                op: value
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

export function parseQuery(keyword: string[], order: string, page: number) {
    const filter = parseFilter(keyword);
    const key = order.slice(1);
    const direction = order.startsWith('-') ? 'desc' : 'asc';

    return {
        filter,
        page,
        order: { key, direction }
    } as SearchQuery;
}
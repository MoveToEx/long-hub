import _ from "lodash";

export default interface SearchSelector {
    text: string[],
    tag: {
        exclude?: string[],
        include?: string[],
    },
    aggr: {
        gte?: number,
        lte?: number,
        lt?: number,
        gt?: number,
        eq?: number,
        ne?: number,
    },
    id: string[],
}

function startsWith(s: string, cd: string[]) {
    return cd.map(c => s.startsWith(c)).reduce((x, y) => x || y);
}

export function parseSelector(items: string[]): SearchSelector {
    let res: SearchSelector = {
        text: items.filter(s => !startsWith(s, ['+', '-', '@', '>', '<'])),
        tag: {
            include: items.filter(s => s.startsWith('+')).map(s => _.trimStart(s, '+')),
            exclude: items.filter(s => s.startsWith('-')).map(s => _.trimStart(s, '-')),
        },
        aggr: _.mapValues(_.pickBy({
            gte: items.find(s => />=[\d.]+/.test(s)),
            lte: items.find(s => /<=[\d.]+/.test(s)),
            gt: items.find(s => />[\d.]+/.test(s)),
            lt: items.find(s => /<[\d.]+/.test(s)),
        }), s => Number(_.trimStart(s, '<=>'))),
        id: items.filter(s => s.startsWith('@')).map(s => _.trimStart(s, '@'))
    };

    return res;
}
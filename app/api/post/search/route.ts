import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import _ from 'lodash';

const operatorMapping = {
    'gt': 'gt',
    'lt': 'lt',
    'le': 'lte',
    'lte': 'lte',
    'ge': 'gte',
    'gte': 'gte',
    'eq': 'equal',
    'ne': 'not',
};

function parseOperator(s: keyof typeof operatorMapping, val: number) {
    return {
        [operatorMapping[s]]: val
    };
}

interface AggrSelector {
    type: 'aggr';
    op: 'gt' | 'lt' | 'lte' | 'gte' | 'eq' | 'ne';
    value: number;
}

interface TagSelector {
    type: 'tag';
    op: 'include' | 'exclude';
    value: string;
}

interface TextSelector {
    type: 'text';
    op: 'contains' | 'not_contains';
    value: string;
}

interface IDSelector {
    type: 'id';
    op: 'contains';
    value: string;
}

type Selector = AggrSelector | TagSelector | TextSelector | IDSelector;

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '24');
    let query: Selector[];
    try {
        query = await req.json();
    }
    catch (e) {
        return NextResponse.json('failed when parsing JSON', {
            status: 400
        });
    }

    if (query.length > 24 || query.length < 1) {
        return NextResponse.json('illegal length of selectors', {
            status: 400
        });
    }

    if (typeof query !== 'object' || !Array.isArray(query)) {
        return NextResponse.json('ill-formed request body', {
            status: 400
        });
    }
    
    let where = [];

    for (const sel of query) {
        if (sel.type == 'text') {
            if (sel.op == 'contains') {
                where.push({
                    text: {
                        contains: sel.value
                    }
                });
            }
            else if (sel.op == 'not_contains') {
                where.push({
                    NOT: {
                        text: {
                            contains: sel.value
                        }
                    }
                });
            }
        }
        else if (sel.type == 'aggr') {
            where.push({
                aggr: parseOperator(sel.op, sel.value)
            });
        }
        else if (sel.type == 'tag') {
            if (sel.op == 'include') {
                where.push({
                    tags: {
                        some: {
                            name: sel.value
                        }
                    }
                });
            }
            else if (sel.op == 'exclude') {
                where.push({
                    tags: {
                        none: {
                            name: sel.value
                        }
                    }
                });
            }
        }
        else if (sel.type == 'id') {
            if (sel.op == 'contains') {
                where.push({
                    id: {
                        contains: sel.value
                    }
                });
            }
        }
    }
    
    const posts = await prisma.post.findMany({
        where: {
            AND: where
        },
        skip: offset,
        take: limit,
        include: {
            uploader: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    const count = await prisma.post.count({
        where: {
            AND: where
        }
    });

    return NextResponse.json({
        count: count,
        data: posts
    });
}
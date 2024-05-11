import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import _ from 'lodash';
import { z } from "zod";

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

const schema = z.array(
    z.union([
        z.object({
            type: z.literal('text'),
            op: z.literal('contains').or(z.literal('not_contains')),
            value: z.string()
        }),
        z.object({
            type: z.literal('aggr'),
            op: z.union([z.literal('gt'), z.literal('lt'), ...['le', 'lte', 'ge', 'gte', 'eq', 'ne'].map(val => z.literal(val))]),
            value: z.number()
        }),
        z.object({
            type: z.literal('tag'),
            op: z.union([z.literal('include'), z.literal('exclude')]),
            value: z.string()
        }),
        z.object({
            type: z.literal('id'),
            op: z.literal('contains'),
            value: z.string()
        })
    ])
).min(1).max(24);

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '24');
    let raw;

    try {
        raw = await req.json();
    }
    catch {
        return new Response('Invalid JSON', {
            status: 400
        });
    }

    const { data: query, error } = schema.safeParse(raw);

    if (error) {
        const err = error.flatten();
        const msg = _.concat(
            err.formErrors,
            _.toPairs(err.fieldErrors).map(([field, msg]) => `Error parsing ${field}: ${msg}`)
        );
        
        return new Response(msg.join('\n'), {
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
                aggr: parseOperator(sel.op as any, sel.value)
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
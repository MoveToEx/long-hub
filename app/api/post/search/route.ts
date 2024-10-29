import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import _ from 'lodash';
import { z } from "zod";
import { Prisma, Rating } from "@prisma/client";

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

function parseOperator(s: keyof typeof operatorMapping, val: number | string) {
    return {
        [operatorMapping[s]]: val
    };
}

const schema = z.array(
    z.discriminatedUnion('type', [
        z.object({
            type: z.literal('text'),
            op: z.union([z.literal('contains'), z.literal('not_contains')]),
            value: z.string()
        }),
        z.object({
            type: z.literal('rating'),
            op: z.undefined(),
            value: z.nativeEnum(Rating)
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
        }),
        z.object({
            type: z.literal('uploader'),
            op: z.literal('is'),
            value: z.string()
        }),
        z.object({
            type: z.literal('system'),
            op: z.literal('untagged'),
            value: z.undefined()
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

    const { data, error } = schema.safeParse(raw);

    if (error) {
        return NextResponse.json(error.errors, {
            status: 400
        });
    }

    const where = {
        AND: [] as NonNullable<Prisma.Args<typeof prisma.post, 'findMany'>['where']>[]
    };

    for (const { type, op, value } of data) {
        if (type == 'text') {
            if (op == 'contains') {
                where.AND.push({
                    text: {
                        contains: value
                    }
                });
            }
            else if (op == 'not_contains') {
                where.AND.push({
                    NOT: {
                        text: {
                            contains: value
                        }
                    }
                });
            }
        }
        else if (type == 'rating') {
            where.AND.push({
                rating: value
            });
        }
        else if (type == 'tag') {
            if (op == 'include') {
                where.AND.push({
                    tags: {
                        some: {
                            name: value
                        }
                    }
                });
            }
            else if (op == 'exclude') {
                where.AND.push({
                    tags: {
                        none: {
                            name: value
                        }
                    }
                });
            }
        }
        else if (type == 'id') {
            if (op == 'contains') {
                where.AND.push({
                    id: {
                        contains: value
                    }
                });
            }
        }
        else if (type == 'uploader') {
            if (op == 'is') {
                where.AND.push({
                    uploader: {
                        name: value
                    }
                });
            }
        }
        else if (type == 'system') {
            if (op == 'untagged') {
                where.AND.push({
                    tags: {
                        none: {}
                    }
                });
            }
        }
    }

    const [posts, count] = await prisma.$transaction(
        [
            prisma.post.findMany({
                where,
                skip: offset,
                take: limit,
                include: {
                    tags: true,
                    uploader: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }),
            prisma.post.count({
                where: {
                    AND: where
                }
            })
        ]
    );

    return NextResponse.json({
        count: count,
        data: posts
    });
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import _ from 'lodash';
import { zjson } from "@/lib/server-util";
import { z } from "zod";
import { Prisma, Rating } from "@prisma/client";

const operatorMapping = {
    'gt': 'gt',
    'ge': 'gte',
    'gte': 'gte',
    'lt': 'lt',
    'le': 'lte',
    'lte': 'lte',
    'eq': 'equal',
    'ne': 'not',
};

const schema = z.object({
    order: z.object({
        key: z.union([
            z.literal('createdAt'),
            z.literal('id'),
            z.literal('uploaderId')
        ]),
        direction: z.union([
            z.literal('asc'),
            z.literal('desc')
        ]).default('asc')
    }).array().default([{ key: 'id', direction: 'asc' }]),
    deleted: z.boolean().default(false),
    filter: z.discriminatedUnion('type', [
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
            op: z.literal('is'),
            value: z.string()
        }),
        z.object({
            type: z.literal('uploader'),
            op: z.literal('is'),
            value: z.string()
        }),
        z.object({
            type: z.literal('createdAt'),
            op: z.union([
                z.literal('gt'),
                z.literal('lt'),
                z.literal('ge'),
                z.literal('le'),
                z.literal('eq'),
                z.literal('ne')
            ]),
            value: z.union([z.string().date(), z.string().datetime()])
        }),
        z.object({
            type: z.literal('updatedAt'),
            op: z.union([
                z.literal('gt'),
                z.literal('lt'),
                z.literal('ge'),
                z.literal('le'),
                z.literal('eq'),
                z.literal('ne')
            ]),
            value: z.union([z.string().date(), z.string().datetime()])
        }),
        z.object({
            type: z.literal('system'),
            op: z.union([
                z.literal('untagged'),
                z.literal('disowned')
            ]),
            value: z.undefined()
        })
    ]).array().min(1).max(24)
});

type Spread<T> = T extends (infer U)[] ? U : never;

type Selector = Spread<z.infer<typeof schema>['filter']>;
type Types = Selector['type'];

type Arg<K extends Types> = Extract<Selector, { type: K }>;

type Entry<K extends Types> = {
    [P in K]: Arg<P>
}[K];

type Transformers = {
    [T in Types]: (args: Arg<T>) => NonNullable<Prisma.Args<typeof prisma.post, 'findMany'>['where']>
};

const rules: Transformers = {
    text: ({ op, value }) => {
        if (op == 'contains') {
            return {
                text: {
                    contains: value
                }
            };
        }
        else if (op == 'not_contains') {
            return {
                NOT: {
                    text: {
                        contains: value
                    }
                }
            };
        }
        const _: never = op;
        return _;
    },
    rating: ({ op, value }) => {
        return {
            rating: value
        };
    },
    tag: ({ op, value }) => {
        if (op == 'include') {
            return {
                tags: {
                    some: {
                        name: value
                    }
                }
            };
        }
        else if (op == 'exclude') {
            return {
                tags: {
                    none: {
                        name: value
                    }
                }
            };
        }
        const _: never = op;
        return _;
    },
    id: ({ op, value }) => {
        if (op == 'is') {
            return {
                id: value
            };
        }
        const _: never = op;
        return _;
    },
    uploader: ({ op, value }) => {
        if (op == 'is') {
            return {
                uploader: {
                    name: value
                }
            };
        }
        const _: never = op;
        return _;
    },
    createdAt: ({ op, value }) => {
        return {
            createdAt: {
                [operatorMapping[op]]: new Date(value)
            }
        };
    },
    updatedAt: ({ op, value }) => {
        return {
            updatedAt: {
                [operatorMapping[op]]: new Date(value)
            }
        };
    },
    system: ({ op }) => {
        if (op == 'untagged') {
            return {
                tags: {
                    none: {}
                }
            };
        }
        else if (op == 'disowned') {
            return {
                uploaderId: {
                    equals: null
                }
            };
        }
        const _: never = op;
        return _;
    }
};

function transform<K extends Types>(item: Entry<K>) {
    const f = rules[item.type];
    return f(item);
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 24);

    const { data, error } = zjson.pipe(schema).safeParse(await req.text());

    if (error) {
        return NextResponse.json({
            message: 'Invalid request',
            error: error.errors
        }, {
            status: 400
        });
    }

    const where = {
        AND: [] as NonNullable<Prisma.Args<typeof prisma.post, 'findMany'>['where']>[]
    };

    for (const item of data.filter) {
        where.AND.push(transform(item));
    }

    if (data.deleted === true) {
        where.AND.push({
            deletedAt: {
                not: null
            }
        });
    }
    else {
        where.AND.push({
            deletedAt: null
        });
    }

    const [posts, count] = await prisma.$transaction([
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
            },
            orderBy: data.order.map(
                ({ key, direction }) => ({
                    [key]: direction
                })
            )
        }),
        prisma.post.count({ where })
    ]);

    return NextResponse.json({
        count: count,
        data: posts
    });
}
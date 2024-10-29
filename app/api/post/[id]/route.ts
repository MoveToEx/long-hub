import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from 'fs';

import { auth } from '@/lib/dal';
import * as C from '@/lib/constants';
import { revalidatePath } from "next/cache";
import { z } from 'zod';
import _ from 'lodash';
import { responses } from "@/lib/server-util";
import { Prisma, Rating } from "@prisma/client";

const updateSchema = z.object({
    text: z.optional(z.string()),
    rating: z.optional(z.nativeEnum(Rating)),
    tags: z.optional(z.array(z.string()))
});

export async function GET(req: NextRequest, {
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const post = await prisma.post.findFirst({
        where: {
            id
        },
        include: {
            tags: true,
            uploader: {
                select: {
                    name: true,
                    id: true
                }
            }
        }
    });

    if (!post) {
        return responses.notFound('Post ' + id);
    }

    return NextResponse.json(post);
}

export async function PUT(req: NextRequest, {
    params
}: {
    params: Promise<{ id: string }>
}) {
    const user = await auth(req);

    if (!user) {
        return responses.unauthorized();
    }

    if ((user.permission & C.Permission.Post.edit) == 0) {
        return responses.forbidden();
    }

    const { id } = await params;

    if (await prisma.post.count({ where: { id } }) == 0) {
        return responses.notFound('Post ' + id);
    }

    const data: Prisma.Args<typeof prisma.post, 'update'>['data'] = {};
    const transactions: Prisma.PrismaPromise<any>[] = [];
    const { data: meta, error } = updateSchema.safeParse(await req.json());

    if (error) {
        return NextResponse.json(error.errors, {
            status: 400
        });
    }

    if (meta.rating !== undefined) {
        data.rating = meta.rating;
    }
    if (meta.text !== undefined) {
        data.text = meta.text;
    }
    if (meta.tags !== undefined) {
        transactions.push(prisma.post.update({
            where: { id },
            data: {
                tags: {
                    set: []
                }
            }
        }));

        data.tags = {
            connectOrCreate: meta.tags.map(name => ({
                where: { name },
                create: { name }
            }))
        };
    }

    const result = _.last(await prisma.$transaction([
        ...transactions,
        prisma.post.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            }
        }),
        prisma.post.findFirst({
            where: { id },
            include: {
                tags: true,
                uploader: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
    ]));

    revalidatePath('/admin');
    revalidatePath('/admin/posts');

    return NextResponse.json(result);
}

export async function DELETE(req: NextRequest, {
    params
}: {
    params: Promise<{ id: string }>
}) {
    const user = await auth(req);

    if (!user) {
        return responses.unauthorized();
    }

    if ((user.permission & C.Permission.Admin.Post.delete) == 0) {
        return responses.forbidden();
    }

    const { id } = await params;

    const post = await prisma.post.findFirst({
        where: {
            id
        }
    });

    if (!post) {
        return responses.notFound('Post ' + id);
    }

    await fs.promises.rm(post.imagePath);

    await prisma.post.delete({
        where: {
            id
        }
    });

    return NextResponse.json('ok');
}
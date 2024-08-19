import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from 'next/headers';
import fs from 'fs';

import { auth, formatZodError } from "@/lib/server-util";
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
    params: {
        id: string
    }
}) {
    const post = await prisma.post.findFirst({
        where: {
            id: params.id
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
        return responses.notFound('Post ' + params.id);
    }

    return NextResponse.json(post);
}

export async function PUT(req: NextRequest, {
    params
}: {
    params: {
        id: string
    }
}) {
    const user = await auth(req, cookies());

    if (!user) {
        return responses.unauthorized();
    }

    if ((user.permission & C.Permission.Post.edit) == 0) {
        return responses.forbidden();
    }

    var post = await prisma.post.findFirst({
        where: {
            id: params.id
        }
    });

    const data: Prisma.postUpdateInput = {};

    if (!post) {
        return responses.notFound('Post ' + params.id);
    }

    const { data: meta, error } = updateSchema.safeParse(await req.json());

    if (error) {
        return new Response(formatZodError(error), {
            status: 400
        });
    }

    if (meta.rating !== undefined) data.rating = meta.rating;
    if (meta.text !== undefined) data.text = meta.text;
    if (meta.tags !== undefined) {
        data.tags = {};
        data.tags.set = [];

        for (const tagName of meta.tags) {
            const tag = await prisma.tag.findFirst({
                where: {
                    name: tagName
                }
            });

            if (tag) {
                data.tags.set.push(tag);
            }
            else {
                data.tags.set.push(await prisma.tag.create({
                    data: {
                        name: tagName
                    }
                }));
            }
        }
    }

    await prisma.post.update({
        where: {
            id: params.id
        },
        data: {
            ...data,
            updatedAt: new Date()
        }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/posts');

    return NextResponse.json(await prisma.post.findFirst({
        where: {
            id: params.id
        },
        include: {
            tags: true,
            uploader: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    }));
}

export async function DELETE(req: NextRequest, {
    params
}: {
    params: {
        id: string
    }
}) {
    const user = await auth(req, cookies());

    if (!user) {
        return responses.unauthorized();
    }

    if ((user.permission & C.Permission.Admin.Post.delete) == 0) {
        return responses.forbidden();
    }

    const post = await prisma.post.findFirst({
        where: {
            id: params.id
        }
    });

    if (!post) {
        return responses.notFound('Post ' + params.id);
    }

    await fs.promises.rm(post.imagePath);

    await prisma.post.delete({
        where: {
            id: params.id
        }
    });

    return NextResponse.json('ok');
}
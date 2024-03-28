import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from 'next/headers';
import fs from 'fs';

import { auth } from "@/lib/server-util";
import * as C from '@/lib/constants';
import { revalidatePath } from "next/cache";

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
            tags: true
        }
    });

    if (!post) {
        return NextResponse.json('post not found', {
            status: 404
        });
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
        return NextResponse.json('unauthorized', {
            status: 401
        });
    }

    if ((user.permission & C.Permission.Post.edit) == 0) {
        return NextResponse.json('operation not permitted', {
            status: 403
        });
    }

    var post = await prisma.post.findFirst({
        where: {
            id: params.id
        }
    });
    const meta = await req.json();
    const data: Record<string, any> = {};

    if (!post) {
        return NextResponse.json('post not found', {
            status: 404
        });
    }

    if (meta.aggr !== undefined && typeof meta.aggr !== 'number') {
        return NextResponse.json('ill-typed aggr', {
            status: 400
        });
    }
    else {
        data.aggr = meta.aggr;
    }

    if (meta.text !== undefined && typeof meta.text !== 'string') {
        return NextResponse.json('ill-typed text', {
            status: 400
        });
    }
    else {
        data.text = meta.text;
    }

    if (meta.tags) {
        if (typeof meta.tags !== 'object' || !Array.isArray(meta.tags)) {
            return NextResponse.json('ill-typed tags', {
                status: 400
            });
        }

        const tags = [];

        for (const tagName of meta.tags) {
            const tag = await prisma.tag.findFirst({
                where: {
                    name: tagName
                }
            });

            if (tag) {
                tags.push({
                    id: tag.id
                });
            }
            else {
                tags.push(await prisma.tag.create({
                    data: {
                        name: tagName
                    }
                }));
            }
        }

        data.tags = {
            connect: tags
        };
    }
    
    await prisma.post.update({
        where: {
            id: params.id
        },
        data: data
    });

    revalidatePath('/post/' + params.id);
    revalidatePath('/admin');
    revalidatePath('/admin/post');

    return NextResponse.json(await prisma.post.findFirst({
        where: {
            id: params.id
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
        return NextResponse.json('unauthorized', {
            status: 401
        });
    }

    if ((user.permission & C.Permission.Admin.Post.delete) == 0) {
        return NextResponse.json('operation not permitted', {
            status: 403
        });
    }

    const post = await prisma.post.findFirst({
        where: {
            id: params.id
        }
    });

    if (!post) {
        return NextResponse.json('post ' + params.id + ' not found', {
            status: 404
        });
    }

    fs.rmSync(post.imagePath);

    await prisma.post.delete({
        where: {
            id: params.id
        }
    });

    return NextResponse.json('ok');
}
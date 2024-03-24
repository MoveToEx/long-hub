import { NextRequest, NextResponse } from "next/server";
import { Post, Tag, User } from "@/lib/db";
import { cookies } from 'next/headers';
import fs from 'fs';

import { auth } from "@/lib/server-util";
import * as C from '@/lib/constants';

export async function GET(req: NextRequest, {
    params
}: {
    params: {
        id: string
    }
}) {
    var post = await Post.findByPk(params.id, {
        include: [
            {
                model: Tag,
                through: {
                    attributes: []
                }
            }
        ]
    });

    if (!post) {
        return NextResponse.json('post not found', {
            status: 404
        });
    }

    return NextResponse.json(post.toJSON());
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

    var post = await Post.findByPk(params.id);
    const meta = await req.json();

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
    
    if (meta.text !== undefined && typeof meta.text !== 'string') {
        return NextResponse.json('ill-typed text', {
            status: 400
        });
    }

    if (meta.tags) {
        if (typeof meta.tags !== 'object' || !Array.isArray(meta.tags)) {
            return NextResponse.json('ill-typed tags', {
                status: 400
            });
        }

        await post.removeTags(await post.getTags());

        for (const tagName of meta.tags) {
            const [tag, _] = await Tag.findOrCreate({
                where: {
                    name: tagName
                },
                defaults: {
                    name: tagName
                }
            });

            await post.addTag(tag);
        }
    }

    post.aggr = meta.aggr ?? 0;
    post.text = meta.text ?? '';

    await post.save();

    return NextResponse.json(post.toJSON());
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

    if ((user.permission & C.Permission.Post.delete) == 0) {
        return NextResponse.json('operation not permitted', {
            status: 403
        });
    }

    const post = await Post.findByPk(params.id);

    if (!post) {
        return NextResponse.json('post ' + params.id + ' not found', {
            status: 404
        });
    }

    fs.rmSync(post.imagePath);

    await post.removeTags(await post.getTags());
    await post.destroy();

    return NextResponse.json('ok');
}
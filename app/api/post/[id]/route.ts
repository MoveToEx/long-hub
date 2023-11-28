import { NextRequest, NextResponse } from "next/server";
import { Post, Tag } from "@/lib/db";
import fs from 'fs';

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
        return NextResponse.json('post not found', { status: 404 });
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
    var post = await Post.findByPk(params.id);
    const meta = await req.json();

    if (!post) {
        return NextResponse.json('post not found', {
            status: 404
        });
    }

    if (meta.aggr !== undefined) {
        if (typeof meta.aggr !== 'number') {
            return NextResponse.json('ill-typed aggr', {
                status: 400
            });
        }
        post.aggr = meta.aggr;
    }

    if (meta.text !== undefined) {
        if (typeof meta.text !== 'string') {
            return NextResponse.json('ill-typed text', {
                status: 400
            });
        }
        post.text = meta.text;
    }

    if (meta.tags) {
        if (typeof meta.tags !== 'object' || !Array.isArray(meta.tags)) {
            return NextResponse.json('ill-typed tags', {
                status: 400
            });
        }

        await post.removeTags();

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

    await post.save();

    return NextResponse.json(post.toJSON(), {
        status: 200
    });
}

export async function DELETE(req: NextRequest, {
    params
}: {
    params: {
        id: string
    }
}) {
    var post = await Post.findByPk(params.id);

    if (!post) {
        return NextResponse.json('post not found', {
            status: 404
        });
    }

    fs.rmSync(post.imagePath);

    await post.removeTags();
    await post.destroy();

    return NextResponse.json({
        id: params.id
    });
}
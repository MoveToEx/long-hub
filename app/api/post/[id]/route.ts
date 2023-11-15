import { NextResponse, NextRequest } from "next/server";
import _ from "lodash";
import { Post, Tag } from "@/lib/db";
import fs from 'fs';

export async function GET(req: NextRequest, {
    params
}: {
    params: {
        id: string
    }
}) {
    var post = await Post.findByPk(params.id);

    if (!post) {
        return NextResponse.json({ error: 'post not found' }, { status: 404 });
    }

    var tags = await (post as any).getTags({
        joinTableAttributes: []
    });

    return NextResponse.json({
        ...post.toJSON(),
        tags: tags.map((x: any) => x.toJSON())
    });
}

export async function PUT(req: NextRequest, {
    params
}: {
    params: {
        id: string
    }
}) {
    var meta = await req.json();

    var post: any = await Post.findByPk(params.id);

    if (!post) {
        return NextResponse.json({ error: 'post not found' }, { status: 404 });
    }

    if (meta.aggr !== undefined) {
        post.aggr = meta.aggr ?? 0.0;
    }
    if (meta.text !== undefined) {
        post.text = meta.text ?? '';
    }
    if (meta.tags) {
        var tags = [];
        for (var s of meta.tags) {
            const [tag, created] = await Tag.findOrCreate({
                where: {
                    name: s
                },
                defaults: {
                    name: s
                }
            });

            tags.push(tag);
        }
        await post.setTags(tags);
    }

    await post.save();

    return NextResponse.json({ info: 'modified' });
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
        return NextResponse.json({ error: 'post ' + params.id + ' not found' }, { status: 404 });
    }

    fs.rmSync('.' + (post as any).image);

    await (post as any).removeTags();
    await post.destroy();

    return NextResponse.json({ info: 'removed' }, { status: 200 });
}
import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import _ from "lodash";
import { seq, Post, Tag } from "@/lib/db";
import { Base64 } from "js-base64";

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

    return NextResponse.json({ status: 'ok' });
}
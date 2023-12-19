import { NextRequest, NextResponse } from "next/server";
import { Tag } from '@/lib/db';

export async function GET(req: NextRequest, {
    params
}: {
    params: {
        name: string
    }
}) {
    const tag = await Tag.findOne({
        where: {
            name: params.name
        }
    });
    const { searchParams } = new URL(req.url);
    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 24);

    if (tag === null) {
        return NextResponse.json('tag not found', {
            status: 404
        });
    }

    const posts = await tag.getPosts({
        offset: offset,
        limit: limit
    });

    return NextResponse.json({
        ...tag.toJSON(),
        "count": await tag.countPosts(),
        "data": posts.map(x => x.toJSON())
    });
}

export async function POST(req: NextRequest, {
    params
}: {
    params: {
        name: string
    }
}) {
    const tag = await Tag.findOne({
        where: {
            name: params.name
        }
    });
    const data = await req.json();

    if (!tag) {
        return NextResponse.json('tag not found', {
            status: 404
        });
    }

    if (data.type) {
        tag.type = data.type;
    }
    if (data.description) {
        tag.description = data.description;
    }
    if (data.summary) {
        tag.summary = data.summary;
    }

    await tag.save();

    return NextResponse.json(tag.toJSON());
}
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
        "count": await tag.countPosts(),
        "data": posts.map(x => x.toJSON())
    });
}
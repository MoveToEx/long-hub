import { NextResponse, NextRequest } from "next/server";
import { Tag } from "@/lib/db";

export async function GET(req: NextRequest, {
    params
}: {
    params: {
        tag: String
    }
}) {
    const { searchParams } = new URL(req.url);
    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '24');

    const tag = await Tag.findOne({
        where: {
            name: params.tag
        }
    });

    const posts = await (tag as any).getPosts({
        joinTableAttributes: []
    }).then((x: any) => x.slice(offset, offset + limit));

    return NextResponse.json(posts.map((x: any) => x.toJSON()));
}
import { NextRequest, NextResponse } from "next/server";
import { Tag } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const tags = await Tag.findAll();
    let result = [];

    for (var tag of tags) {
        result.push({
            ...tag.toJSON(),
            count: await tag.countPosts()
        });
    }

    return NextResponse.json(result);
}
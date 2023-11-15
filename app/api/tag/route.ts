import { NextResponse, NextRequest } from "next/server";
import { Tag } from "@/lib/db";

export async function GET(req: NextRequest) {
    var tags = await Tag.findAll();
    var res = [];
    for (var tag of tags) {
        res.push({
            ...tag.toJSON(),
            count: await (tag as any).countPosts()
        });
    }
    return NextResponse.json(res);
}
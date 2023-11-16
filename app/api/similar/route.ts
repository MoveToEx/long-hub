import { NextResponse, NextRequest } from "next/server";
import _ from 'lodash';
import { Post, Tag } from "@/lib/db";
// @ts-expect-error -- upstream types do not exist: https://github.com/btd/sharp-phash/issues/14
import phash from "sharp-phash";
// @ts-expect-error -- upstream types do not exist: https://github.com/btd/sharp-phash/issues/14
import phashDistance from "sharp-phash/distance";

const SIMILAR_THRESHOLD = 4;

export async function POST(req: NextRequest) {
    var fd = await req.formData();
    var img = fd.get('image') as File;
    var res = [];

    if (!img) {
        return NextResponse.json({ error: 'image missing' }, { status: 400 });
    }

    try {
        const buf = Buffer.from(await img.arrayBuffer());
        const hash = await phash(buf);
        const posts = await Post.findAll({
            attributes: ['id', 'image', 'imageHash']
        });

        for (var post of posts) {
            if (phashDistance(hash, (post as any).imageHash) <= SIMILAR_THRESHOLD) {
                res.push({
                    id: (post as any).id,
                    image: (post as any).image
                });
            }
        }

    }
    catch (e) {
        return NextResponse.json({ error: 'bad Request: ' + e }, { status: 400 });
    }

    return NextResponse.json(res)
}
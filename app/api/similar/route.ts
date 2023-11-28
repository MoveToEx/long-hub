import { NextRequest, NextResponse } from "next/server";
import { Post } from '@/lib/db';

// @ts-expect-error
import phash from 'sharp-phash';

// @ts-expect-error
import phashDistance from 'sharp-phash/distance';

const SIMILAR_THRESHOLD = 4;

export async function POST(req: NextRequest) {
    const fd = await req.formData();

    if (!fd.has('image')) {
        return NextResponse.json('no image found', {
            status: 204
        });
    }

    const img = fd.get('image') as File;
    var result = [];

    var buffer = Buffer.from(await img.arrayBuffer());

    const hash = await phash(buffer);
    const posts = await Post.findAll({
        attributes: ['id', 'image', 'imageURL', 'imageHash']
    });

    for (var post of posts) {
        if (phashDistance(hash, post.imageHash) <= SIMILAR_THRESHOLD) {
            result.push({
                id: post.id,
                imageURL: post.imageURL
            });
        }
    }

    return NextResponse.json(result);
}
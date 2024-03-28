import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';
import sharp from 'sharp';

// @ts-expect-error
import phash from 'sharp-phash';

// @ts-expect-error
import phashDistance from 'sharp-phash/distance';

const SIMILAR_THRESHOLD = 8;

export async function POST(req: NextRequest) {
    const fd = await req.formData();

    if (!fd.has('image')) {
        return NextResponse.json('no image found', {
            status: 400
        });
    }

    const img = fd.get('image') as File;
    
    var buf = await sharp(await img.arrayBuffer()).trim({
        background: 'rgba(255, 255, 255, 0)'
    }).toBuffer();

    const hash = await phash(buf);

    const posts = await prisma.post.findMany({
        select: {
            id: true,
            image: true,
            imageURL: true,
            imageHash: true
        }
    });
    
    let result = [];
    
    for (var post of posts) {
        const dist = phashDistance(hash, post.imageHash);
        if (dist <= SIMILAR_THRESHOLD) {
            result.push({
                id: post.id,
                imageURL: post.imageURL,
                diff: dist
            });
        }
    }

    return NextResponse.json({
        hash: hash,
        similar: result
    });
}
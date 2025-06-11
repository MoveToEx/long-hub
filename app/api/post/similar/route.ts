import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';
import phash from 'sharp-phash';

const SIMILAR_THRESHOLD = 8;

export async function POST(req: NextRequest) {
    let hash;
    try {
        hash = await phash(await req.arrayBuffer());
    }
    catch (e) {
        return NextResponse.json({
            message: 'Invalid image'
        }, {
            status: 400
        });
    }

    const posts = await prisma.$queryRaw`
        SELECT
            "id",
            "imageURL",
            "imageHash",
            levenshtein(${hash}, "imageHash") AS diff
        FROM public.post
        WHERE
            "imageHash" IS NOT NULL AND 
            "deletedAt" IS NULL AND
            levenshtein_less_equal(${hash}, "imageHash", ${SIMILAR_THRESHOLD}::int) <= ${SIMILAR_THRESHOLD}
        ORDER BY diff ASC
        LIMIT 4`;

    return NextResponse.json({
        hash: hash,
        similar: posts
    });
}
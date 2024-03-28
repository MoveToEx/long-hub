import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const tags = await prisma.tag.findMany({
        select: {
            id: true,
            name: true,
            _count: {
                select: {
                    posts: true
                }
            }
        }
    });
    let result = [];

    for (var tag of tags) {
        
        result.push({
            id: tag.id,
            name: tag.name,
            count: tag._count.posts
        });
    }

    return NextResponse.json(result);
}
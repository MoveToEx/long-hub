import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, {
    params
}: {
    params: {
        name: string
    }
}) {
    const { searchParams } = new URL(req.url);
    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 24);

    const tag = await prisma.tag.findFirst({
        where: {
            name: params.name
        },
        include: {
            posts: {
                take: limit,
                skip: offset
            }
        }
    });

    const count = await prisma.tag.findFirst({
        where: {
            name: params.name
        },
        select: {
            _count: {
                select: {
                    posts: true
                }
            }
        }
    });

    if (tag === null) {
        return NextResponse.json('tag not found', {
            status: 404
        });
    }

    return NextResponse.json({
        "count": count?._count.posts,
        "data": tag.posts
    });
}
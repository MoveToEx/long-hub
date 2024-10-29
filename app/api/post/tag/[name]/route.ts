import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, {
    params
}: {
    params: Promise<{ name: string }>
}) {
    const { searchParams } = new URL(req.url);
    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 24);
    const { name } = await params;

    const [tag, count] = await prisma.$transaction([
        prisma.tag.findFirst({
            where: { name },
            include: {
                posts: {
                    take: limit,
                    skip: offset
                }
            }
        }),
        prisma.post.count({
            where: {
                tags: {
                    some: {
                        name
                    }
                }
            }
        })
    ]);

    if (tag === null) {
        return NextResponse.json('tag not found', {
            status: 404
        });
    }

    return NextResponse.json({
        "count": count,
        "data": tag.posts
    });
}
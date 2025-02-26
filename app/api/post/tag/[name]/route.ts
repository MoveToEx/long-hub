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

    if (await prisma.tag.count({ where: { name } }) == 0) {
        return NextResponse.json('tag not found', {
            status: 404
        });
    }

    const [posts, count] = await prisma.$transaction([
        prisma.post.findMany({
            where: {
                tags: {
                    some: { name }
                },
                deletedAt: null
            },
            include: {
                tags: true,
                uploader: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            take: limit,
            skip: offset
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

    return NextResponse.json({
        "count": count,
        "data": posts
    });
}
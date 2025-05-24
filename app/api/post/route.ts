import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";
import _ from 'lodash';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 24);

    const [posts, count] = await prisma.$transaction([
        prisma.post.findMany({
            where: {
                deletedAt: null
            },
            orderBy: [
                {
                    createdAt: 'desc',
                },
                {
                    id: 'asc'
                }
            ],
            include: {
                tags: true,
                uploader: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            skip: offset,
            take: limit
        }),
        prisma.post.count({
            where: {
                deletedAt: null
            }
        })
    ])

    return NextResponse.json({
        count: count,
        data: posts
    });
}

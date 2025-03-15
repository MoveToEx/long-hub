import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    const prefix = params.get('prefix');
    const limit = Number(params.get('limit') ?? 24);
    const offset = Number(params.get('offset') ?? 0);
    const count = await prisma.tag.count();

    const tags = await prisma.tag.findMany({
        include: {
            _count: {
                select: {
                    posts: {
                        where: {
                            deletedAt: null
                        }
                    }
                }
            }
        },
        where: {
            name: prefix ? {
                startsWith: prefix
            } : {}
        },
        take: limit,
        skip: offset
    });

    return NextResponse.json({
        count,
        data: tags.map(tag => ({
            name: tag.name,
            id: tag.id,
            count: tag._count.posts,
        }))
    });
}
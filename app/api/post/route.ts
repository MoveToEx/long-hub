import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";
import _ from 'lodash';
import { auth } from '@/lib/dal';
import { Prisma } from '@/lib/schema';

export async function GET(req: NextRequest) {
    const offset = Number(req.nextUrl.searchParams.get('offset') ?? 0);
    const limit = Number(req.nextUrl.searchParams.get('limit') ?? 24);

    let where: Prisma.Args<typeof prisma.post, 'findFirst'>['where'] = {
        deletedAt: null
    };

    const user = await auth();

    if (user?.preference?.allowNSFW !== true) {
        where = {
            ...where,
            tags: {
                none: {
                    name: 'nsfw'
                }
            }
        }
    }

    const [posts, count] = await prisma.$transaction([
        prisma.post.findMany({
            where,
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
        prisma.post.count({ where })
    ])

    return NextResponse.json({
        count: count,
        data: posts
    });
}

import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';


const paramSchema = z.object({
    id: z.coerce.number().positive().int()
});

export async function GET(req: NextRequest, { params }: {
    params: Promise<{ id: string }>
}) {
    let id;

    const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '24');
    
    try {
        const data = paramSchema.parse(await params);
        id = data.id;
    }
    catch (e) {
        if (e instanceof Error) {
            return NextResponse.json({
                error: 'Illegal ID'
            }, {
                status: 400
            });
        }
    }

    const user = await prisma.user.findFirst({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            createdAt: true,
            post: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: offset
            }
        }
    });

    if (user === null) {
        return NextResponse.json({
            error: 'User not found'
        }, {
            status: 404
        });
    }

    return NextResponse.json(user);
}
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";
import _ from 'lodash';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 24);

    const templates = await prisma.template.findMany({
        orderBy: [
            {
                createdAt: 'desc'
            }
        ],
        skip: offset,
        take: limit
    });

    return NextResponse.json({
        count: await prisma.template.count(),
        data: templates
    });
}


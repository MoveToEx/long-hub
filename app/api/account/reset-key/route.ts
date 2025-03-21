import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { auth } from '@/lib/dal';
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const user = await auth();

    if (user == null) {
        return NextResponse.json('unauthorized', {
            status: 401
        });
    }

    const key = crypto.randomBytes(32).toString('base64url')

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            accessKey: key
        }
    });

    return NextResponse.json({
        accessKey: key
    });
}
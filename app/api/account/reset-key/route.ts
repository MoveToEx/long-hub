import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from 'crypto';
import { auth } from "@/lib/server-util";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const user = await auth(req, cookies());

    if (user == null) {
        return NextResponse.json('unauthorized', {
            status: 401
        });
    }

    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            accessKey: crypto.randomBytes(32).toString('base64url')
        }
    });

    return NextResponse.json({
        accessKey: user.accessKey
    });
}
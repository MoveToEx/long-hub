import { NextRequest, NextResponse } from "next/server";
import { Session } from "@/lib/types";
import { cookies } from "next/headers";
import crypto from 'crypto';
import { auth } from "@/lib/server-util";

export async function GET(req: NextRequest) {

    const user = await auth(req, cookies());

    if (user == null) {
        return NextResponse.json('unauthorized', {
            status: 401
        });
    }

    user.accessKey = crypto.randomBytes(32).toString('base64url');

    await user.save();

    return NextResponse.json({
        accessKey: user.accessKey
    });
}
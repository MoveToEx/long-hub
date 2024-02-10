import { NextRequest, NextResponse } from "next/server";
import { Session } from "@/lib/types";
import { cookies } from "next/headers";
import { auth } from "@/lib/server-util";

export async function GET(req: NextRequest) {

    const user = await auth(req, cookies());

    if (user == null) {
        return NextResponse.json('unauthorized', {
            status: 401
        }); 
    }

    return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        permission: user.permission,
        accessKey: user.accessKey,
        createdAt: user.createdAt
    });
}
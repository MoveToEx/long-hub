import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/server-util";

export async function GET(req: NextRequest) {

    const user = await auth(req, cookies());

    if (user == null) {
        return NextResponse.json('unauthorized', {
            status: 401
        }); 
    }

    return NextResponse.json(user);
}
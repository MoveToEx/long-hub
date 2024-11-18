import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/lib/dal';

export async function GET(req: NextRequest) {

    const user = await auth(req);

    if (user == null) {
        return new NextResponse(null, {
            status: 401
        }); 
    }

    return NextResponse.json(user);
}
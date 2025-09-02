import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/lib/dal';
import { schema } from "@/lib/preference";

export async function GET(req: NextRequest) {

    const user = await auth();

    if (user == null) {
        return new NextResponse(null, {
            status: 401
        }); 
    }

    return NextResponse.json({
        ...user,
        preference: schema.parse(user.preference)
    });
}
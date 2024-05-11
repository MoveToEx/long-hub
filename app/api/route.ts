import { NextRequest, NextResponse } from "next/server";



export async function NMSL(req: NextRequest) {
    return new Response('nmsl', {
        status: 418
    });
}
import { NextResponse, NextRequest } from "next/server";
import { Tag } from "@/lib/db";
import fs from 'fs';


export async function GET(req: NextRequest, {
    params
}: {
    params: {
        file: String
    }
}) {

    if (!fs.existsSync('./upload/posts/' + params.file)) {
        return NextResponse.json({ error: 'file not found' }, { status: 404 });
    }

    const content = fs.readFileSync('./upload/posts/' + params.file);

    return new NextResponse(content);
}
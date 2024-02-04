import { NextRequest } from "next/server";
import { getSession } from "@/lib/server-util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
    const session = await getSession(req, cookies());

    session.destroy();

    redirect('/');
}
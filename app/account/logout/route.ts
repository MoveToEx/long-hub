import { NextRequest } from "next/server";
import { getSession } from "@/lib/server-util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET() {
    const session = await getSession(cookies());

    session.destroy();

    redirect('/');
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { cookieSettings } from "@/lib/server-util";
import { Session } from "@/lib/session";

export async function GET() {
    const session = await getIronSession<Session>(await cookies(), cookieSettings);

    session.destroy();

    redirect('/');
}
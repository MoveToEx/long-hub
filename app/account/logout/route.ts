import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function GET() {
    const session = await getSession();

    session.destroy();

    redirect('/');
}
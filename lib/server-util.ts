import { User } from '@/lib/db';
import { getIronSession } from "iron-session";
import { Session } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export async function getSession(req: NextRequest, resOrCookies: NextResponse | ReadonlyRequestCookies) {
    let session;
    if (resOrCookies instanceof NextResponse) {
        session = await getIronSession<Session>(req, resOrCookies, {
            password: process.env['COOKIE_SECRET'] as string,
            cookieName: process.env['COOKIE_NAME'] as string
        });
    }
    else {
        session = await getIronSession<Session>(resOrCookies, {
            password: process.env['COOKIE_SECRET'] as string,
            cookieName: process.env['COOKIE_NAME'] as string
        });
    }
    return session;
}

export async function auth(req: NextRequest, resOrCookies: NextResponse | ReadonlyRequestCookies): Promise<User | null> {
    let user;

    const session = await getSession(req, resOrCookies);

    if (session.expire > new Date()) {
        session.destroy();
        return null;
    }

    if (session.userId) {
        user = await User.findByPk(session.userId);
    }

    if (user) return user;

    const key = req.headers.get('X-Access-Key');

    if (key) {
        user = await User.findOne({
            where: {
                accessKey: key
            }
        });
    }

    if (user) return user;

    return null;
}
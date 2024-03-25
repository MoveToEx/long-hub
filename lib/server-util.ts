import { User } from '@/lib/db';
import { IronSession, getIronSession } from "iron-session";
import { Session } from "@/lib/server-types";
import { NextRequest, NextResponse } from "next/server";
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export const cookieSettings = {
    password: process.env['COOKIE_SECRET'] as string,
    cookieName: process.env['COOKIE_NAME'] as string,
    ttl: 60 * 24 * 60 * 60,
}

export async function getSession(req: NextRequest, res: NextResponse): Promise<IronSession<Session>>;
export async function getSession(cookie: ReadonlyRequestCookies): Promise<IronSession<Session>>;

export async function getSession(req: NextRequest | ReadonlyRequestCookies, res?: NextResponse) {
    let session;
    if (req instanceof NextRequest && res instanceof NextResponse) {
        session = await getIronSession<Session>(req, res, cookieSettings);
    }
    else {
        session = await getIronSession<Session>(req as ReadonlyRequestCookies, cookieSettings);
    }
    return session;
}

export async function authByKey(request: NextRequest): Promise<User | null> {
    const key = request.headers.get('X-Access-Key');

    if (!key) return null;

    const user = await User.findOne({
        where: {
            accessKey: key
        }
    });

    return user ? user : null;
}

export async function authBySession(request: NextRequest, response: NextResponse): Promise<User | null> {
    const session = await getIronSession<Session>(request, response, cookieSettings);

    if (!session) return null;

    if (session.expire > new Date()) {
        session.destroy();
        return null;
    }

    if (!session.userId) return null;

    const user = await User.findByPk(session.userId);

    return user;
}


export async function authByCookies(cookies: ReadonlyRequestCookies): Promise<User | null> {
    const session = await getIronSession<Session>(cookies, cookieSettings);

    if (session.expire > new Date()) {
        session.destroy();
        return null;
    }

    if (!session.userId) return null;

    const user = await User.findByPk(session.userId);

    return user ? user : null;
}

export async function auth(req: NextRequest, cookies: ReadonlyRequestCookies): Promise<User | null> {
    let user = await authByKey(req);

    if (!user) {
        user = await authByCookies(cookies);
    }

    return user ? user : null;
}
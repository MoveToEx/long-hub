import { User } from '@/lib/db';
import { IronSession, getIronSession } from "iron-session";
import { Session } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export async function getSession(req: NextRequest, res: NextResponse): Promise<IronSession<Session>>;
export async function getSession(cookie: ReadonlyRequestCookies): Promise<IronSession<Session>>;


export async function getSession(req: NextRequest | ReadonlyRequestCookies, res?: NextResponse) {
    let session;
    if (req instanceof NextRequest && res instanceof NextResponse) {
        session = await getIronSession<Session>(req, res, {
            password: process.env['COOKIE_SECRET'] as string,
            cookieName: process.env['COOKIE_NAME'] as string
        });
    }
    else {
        session = await getIronSession<Session>(req as ReadonlyRequestCookies, {
            password: process.env['COOKIE_SECRET'] as string,
            cookieName: process.env['COOKIE_NAME'] as string
        });
    }
    return session;
}

export async function auth(req: NextRequest, res: NextResponse | ReadonlyRequestCookies): Promise<User | null> {
    let user, session;

    if (req instanceof NextRequest && res instanceof NextResponse) {
        session = await getIronSession<Session>(req, res, {
            password: process.env['COOKIE_SECRET'] as string,
            cookieName: process.env['COOKIE_NAME'] as string
        });
    }
    else {
        session = await getIronSession<Session>(res as ReadonlyRequestCookies, {
            password: process.env['COOKIE_SECRET'] as string,
            cookieName: process.env['COOKIE_NAME'] as string
        });
    }

    // const session = await getSession(req, res);

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
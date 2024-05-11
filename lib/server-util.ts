import { prisma } from '@/lib/db';
import { IronSession, getIronSession } from "iron-session";
import { Session } from "@/lib/server-types";
import { NextRequest, NextResponse } from "next/server";
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { ZodError } from 'zod';
import _ from 'lodash';

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

export async function authByKey(request: NextRequest) {
    const key = request.headers.get('X-Access-Key');

    if (!key) return null;

    const user = await prisma.user.findFirst({
        where: {
            accessKey: key
        }
    });

    return user;
}

export async function authByCookies(cookies: ReadonlyRequestCookies) {
    const session = await getIronSession<Session>(cookies, cookieSettings);

    if (session.expire > new Date()) {
        session.destroy();
        return null;
    }

    if (!session.userId) return null;

    const user = await prisma.user.findFirst({
        where: {
            id: session.userId
        }
    });

    return user;
}

export async function auth(req: NextRequest, cookies: ReadonlyRequestCookies) {
    let user = await authByKey(req);

    if (!user) {
        user = await authByCookies(cookies);
    }

    return user;
}

export function formatZodError(error: ZodError): string {
    const data = error.flatten();
    const msg = _.concat(
        data.formErrors,
        _.toPairs(data.fieldErrors).map(([field, msg]) => `Error parsing ${field}: ${msg}`)
    );
    return msg.join('\n');
}

export const responses = {
    forbidden() {
        return new Response(null, {
            status: 403
        })
    },
    unauthorized() {
        return new Response(null, {
            status: 401
        })
    },
    notFound(entity: string) {
        return new Response(entity + ' not found', {
            status: 404
        });
    },
    badRequest(reason: string) {
        return new Response(reason, {
            status: 400
        });
    }
}
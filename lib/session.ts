import 'server-only';
import env from '@/lib/env';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface Session {
    userId: number;
    username: string;
    expire: Date;
}

export const cookieSettings = {
    password: env.COOKIE_SECRET,
    cookieName: env.COOKIE_NAME,
    ttl: 60 * 24 * 60 * 60,
};

export async function getSession() {
    const session = getIronSession<Session>(await cookies(), cookieSettings);
    return session;
}
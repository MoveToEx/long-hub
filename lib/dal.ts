import 'server-only';

import { prisma } from '@/lib/db';
import { getSession } from "@/lib/session";
import _ from 'lodash';
import { headers } from 'next/headers';

export async function authByKey() {
    const hdr = await headers();

    const authorization = hdr.get('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
        return null;
    }

    const key = authorization.slice('Bearer '.length);

    const user = await prisma.user.findFirst({
        where: {
            accessKey: key
        }
    });

    return user;
}

export async function authByCookies() {
    const session = await getSession();

    if (session.expire < Number(new Date())) {
        session.destroy();
        return null;
    }

    if (!session.id) return null;

    const user = await prisma.user.findFirst({
        where: {
            id: session.id
        }
    });

    return user;
}

export async function auth(permission: number | undefined = undefined) {
    let user = await authByKey();

    if (!user) {
        user = await authByCookies();
    }

    if (!user) {
        return null;
    }

    if (permission !== undefined && (user.permission & permission) != permission) {
        return null;
    }

    return user;
}
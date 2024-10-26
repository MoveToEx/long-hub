import 'server-only';

import { prisma } from '@/lib/db';
import { getSession } from "@/lib/session";
import { NextRequest } from "next/server";
import _ from 'lodash';

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

export async function authByCookies() {
    const session = await getSession();

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

export async function auth(req: NextRequest | undefined = undefined) {
    let user;

    if (req !== undefined) {
        user = await authByKey(req);
    }

    if (!user) {
        user = await authByCookies();
    }

    return user;
}
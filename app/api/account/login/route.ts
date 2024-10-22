import { NextRequest, NextResponse } from 'next/server';
import { Session } from '@/lib/server-types';
import { getIronSession } from 'iron-session';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { cookieSettings } from '@/lib/server-util';

export async function POST(req: NextRequest) {
    const session = await getIronSession<Session>(cookies(), cookieSettings);

    const data = await req.json();

    if (!data.username || !data.password) {
        return NextResponse.json('invalid request', {
            status: 400
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            name: data.username
        }
    });

    if (user == null) {
        return NextResponse.json('invalid username/password', {
            status: 401
        });
    }

    if (!bcrypt.compareSync(data.password, user.passwordHash)) {
        return NextResponse.json('invalid email/password', {
            status: 401
        });
    }

    session.userId = user.id;
    session.username = user.name;

    await session.save();

    return NextResponse.json(user);
}
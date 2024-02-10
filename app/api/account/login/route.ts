import { NextRequest, NextResponse } from 'next/server';
import { Session } from '@/lib/types';
import { getIronSession } from 'iron-session';
import { User } from '@/lib/db';
import bcrypt from 'bcrypt';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    const session = await getIronSession<Session>(cookies(), {
        password: process.env['COOKIE_SECRET'] as string,
        cookieName: process.env['COOKIE_NAME'] as string
    });

    const data = await req.json();

    if (!data.username || !data.password) {
        return NextResponse.json('invalid request', {
            status: 400
        });
    }

    const user = await User.findOne({
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

    return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        accessKey: user.accessKey
    });
}
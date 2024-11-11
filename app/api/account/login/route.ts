import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';
import { z } from 'zod';

const schema = z.object({
    username: z.string(),
    password: z.string(),
    ttl: z.number().max(2592000).default(2592000)
});

export async function POST(req: NextRequest) {
    const { data, success, error } = schema.safeParse(await req.json());
    
    if (!success) {
        return NextResponse.json(error.errors, {
            status: 400
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            name: data.username
        }
    });
    
    if (user === null || !bcrypt.compareSync(data.password, user.passwordHash)) {
        return NextResponse.json('invalid username/password', {
            status: 401
        });
    }
    
    const session = await getSession();

    session.id = user.id;

    let date = new Date();
    date.setSeconds(date.getSeconds() + data.ttl);
    session.expire = Number(date);

    await session.save();

    return NextResponse.json(user);
}
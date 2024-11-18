'use server';

import _ from 'lodash';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function login(state: unknown, fd: FormData) {
    const username = fd.get('username')?.toString();
    const pswd = fd.get('password')?.toString();
    const extend = fd.get('extend')?.toString();

    if (!(username && pswd)) {
        return {
            error: true,
            message: 'Invalid credential'
        };
    }

    const user = await prisma.user.findFirst({
        where: {
            name: username
        }
    });

    if (user == null) {
        return {
            error: true,
            message: 'Invalid credential'
        };
    }

    if (!bcrypt.compareSync(pswd, user.passwordHash)) {
        return {
            error: true,
            message: 'Invalid credential'
        };
    }
    const session = await getSession();

    const expireDate = new Date();

    if (extend === 'on') expireDate.setMonth(expireDate.getMonth() + 1);
    else expireDate.setDate(expireDate.getDate() + 1);

    session.id = user.id;
    session.expire = Number(expireDate);

    await session.save();

    return {
        error: false,
        message: ''
    };
}
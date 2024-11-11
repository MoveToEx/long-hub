'use server';

import _ from 'lodash';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function login(state: any, fd: FormData) {
    const username = fd.get('username') as string;
    const pswd = fd.get('password') as string;
    const expire = fd.get('expire') as string;

    const user = await prisma.user.findFirst({
        where: {
            name: username
        }
    });

    if (user == null) {
        return 'Invalid credential';
    }

    if (!bcrypt.compareSync(pswd, user.passwordHash)) {
        return 'Invalid credential';
    }
    const session = await getSession();

    const expireDate = new Date();

    if (expire) expireDate.setMonth(expireDate.getMonth() + 1);
    else expireDate.setDate(expireDate.getDate() + 1);

    session.id = user.id;
    session.expire = Number(expireDate);

    await session.save();

    redirect('/');
}
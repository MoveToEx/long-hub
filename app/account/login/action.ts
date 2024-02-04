'use server';

import { seq, User } from '@/lib/db';
import _ from 'lodash';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { Session } from '@/lib/types';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt'; 

export default async function login(state: any, fd: FormData) {
    const username = fd.get('username') as string;
    const pswd = fd.get('password') as string;
    const expire = fd.get('expire') as string;

    const user = await User.findOne({
        where: {
            name: username
        }
    });
    
    if (user == null) {
        return 'username/password does not match';
    }
    
    if (!bcrypt.compareSync(pswd, user.passwordHash)) {
        return 'username/password does not match';
    }
    
    const session = await getIronSession<Session>(cookies(), {
        cookieName: process.env['COOKIE_NAME'] as string,
        password: process.env['COOKIE_SECRET'] as string
    });

    const date = new Date();
    if (expire) date.setMonth(date.getMonth() + 1);
    else date.setDate(date.getDate() + 1);

    session.userId = user.id;
    session.username = user.name;
    session.accessKey = user.accessKey;
    session.expire = date;

    await session.save();

    revalidatePath('/');
    redirect('/');
}
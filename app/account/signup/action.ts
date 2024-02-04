'use server';

import { User } from '@/lib/db';
import { redirect } from 'next/navigation';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import * as C from '@/lib/constants';

export default async function signUp(_state: string, fd: FormData) {
    const username = fd.get('username') as string;
    const pswd = fd.get('password') as string;

    if (!username || !pswd) {
        return 'missing required fields';
    }
    
    if (await User.count({
        where: { name: username }
    })) {
        return 'username taken';
    }

    const hash = bcrypt.hashSync(pswd, C.saltRound);
    
    await User.create({
        name: username,
        passwordHash: hash,
        permission: C.Permission.write
    });

    redirect('/account/login');
}
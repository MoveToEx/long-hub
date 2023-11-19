'use server';

/*

import * as React from 'react';
import { seq, User } from '@/lib/db';
import { genAccessKey } from '@/lib/util';
import _ from 'lodash';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const bcrypt = require('bcrypt');

export default async function signIn(state: any, fd: FormData) {
    var username = fd.get('username');
    var pswd = fd.get('password');

    await User.sync();

    if (await User.count({
        where: { name: username }
    }) == 0) {
        return {
            ts: new Date().getTime(),
            code: 1,
            info: 'username/password does not match'
        };
    }
    
    var user = await User.findOne({
        where: {
            name: username
        }
    });

    if (!bcrypt.compareSync(pswd, (user as any).passwordHash)) {
        return {
            ts: new Date().getTime(),
            code: 1,
            info: 'username/password does not match'
        };
    }

    revalidatePath('/');
    redirect('/');
}

*/

export default async function signIn(state: any, fd: FormData) {
    return;
}
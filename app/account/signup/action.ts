'use server';
/*
import * as React from 'react';
import { seq, User } from '@/lib/db';
import { genAccessKey } from '@/lib/util';
import { redirect } from 'next/navigation';
import _ from 'lodash';

const bcrypt = require('bcrypt');

const saltRound = 10;

export default async function signUp(state: any, fd: FormData) {
    await User.sync();

    var pswd = fd.get('password');
    
    if (await User.count({
        where: { name: fd.get('username') }
    })) {
        return 'username taken';
    }

    var hash = bcrypt.hashSync(pswd, saltRound);
    
    var user = await User.create({
        name: fd.get('username'),
        passwordHash: hash,
        accessKey: genAccessKey()
    });

    redirect('/account/signin');
}*/

export default async function signUp(state: any, fd: FormData) {
    return '';
}
'use server';

import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import * as C from '@/lib/constants';
import crypto from 'crypto';

export default async function signUp(_state: string, fd: FormData) {
    const username = fd.get('username') as string;
    const password = fd.get('password') as string;
    const confirmPassword = fd.get('password-confirm') as string;

    if (!username || !password) {
        return 'Missing required fields';
    }

    if (!/^[a-zA-Z0-9_]{4,}$/.test(username)) {
        return 'Invalid username';
    }

    if (password != confirmPassword) {
        return 'Password does not match';
    }

    if (password.length < 8) {
        return 'Password too short';
    }
    
    if (await prisma.user.count({
        where: { name: username }
    })) {
        return 'Username already taken';
    }

    const hash = bcrypt.hashSync(password, C.saltRound);

    await prisma.user.create({
        data: {
            name: username,
            passwordHash: hash,
            accessKey: crypto.randomBytes(32).toString('base64url'),
            permission: C.Permission.Post.edit | C.Permission.Post.new,
            createdAt: new Date()
        }
    });

    redirect('/account/login');
}
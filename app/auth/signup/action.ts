'use server';

import { prisma } from '@/lib/db';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import * as C from '@/lib/constants';
import crypto from 'crypto';
import { headers } from 'next/headers';
import env from '@/lib/env';
import { get } from '@/lib/config';

const turnstileSecret = env.CF_TURNSTILE_SECRET;

export default async function signUp(_state: unknown, fd: FormData) {
    if (await get('allowRegistration') === false) {
        return {
            error: true,
            message: 'Registration disabled for this site',
            timestamp: Number(new Date())
        }
    }
    const username = fd.get('username') as string;
    const password = fd.get('password') as string;
    const confirmPassword = fd.get('password-confirm') as string;

    const token = fd.get('cf-turnstile-response') as string;
    const header = await headers();
    const ip = header.get('CF-Connecting-IP') as string;

    let tf = new FormData();
    tf.append('secret', turnstileSecret);
    tf.append('response', token);
    tf.append('remoteip', ip);

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    const response = await fetch(url, {
        body: tf,
        method: 'POST'
    });

    const data = await response.json();

    if (!data.success) {
        return {
            error: true,
            message: 'Invalid captcha',
            timestamp: Number(new Date())
        };
    }

    if (!username || !password) {
        return {
            error: true,
            message: 'Missing required fields',
            timestamp: Number(new Date())
        };
    }

    if (!/^[a-zA-Z0-9_]{4,}$/.test(username)) {
        return {
            error: true,
            message: 'Username has been occupied',
            timestamp: Number(new Date())
        };
    }

    if (password != confirmPassword) {
        return {
            error: true,
            message: 'Password does not match',
            timestamp: Number(new Date())
        };
    }

    if (password.length < 8) {
        return {
            error: true,
            message: 'Password too short',
            timestamp: Number(new Date())
        };
    }

    if (await prisma.user.count({
        where: { name: username }
    })) {
        return {
            error: true,
            message: 'Username already taken',
            timestamp: Number(new Date())
        };
    }

    const hash = bcrypt.hashSync(password, C.saltRound);

    await prisma.user.create({
        data: {
            name: username,
            passwordHash: hash,
            accessKey: crypto.randomBytes(32).toString('base64url'),
            permission: await get('defaultPermission'),
            createdAt: new Date()
        }
    });

    return {
        error: false,
        timestamp: Number(new Date()),
    }
}
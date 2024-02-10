'use server';

import { User } from '@/lib/db';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/server-util';
import { redirect } from 'next/navigation';

export async function resetAccessKey() {
    const session = await getSession(cookies());

    if (!session.userId) redirect('/account/login');

    const user = await User.findByPk(session.userId);

    if (!user) redirect('/');

    user.accessKey = crypto.randomBytes(32).toString('base64url');

    await user.save();

    redirect('/account');
}
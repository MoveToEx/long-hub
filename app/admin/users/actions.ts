'use server';

import { User } from "@/lib/db";
import { authByCookies } from "@/lib/server-util";
import crypto from 'crypto';
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as C from '@/lib/constants';

export async function DeleteUser(fd: FormData) {
    const op = await authByCookies(cookies());

    if (!op) return;

    if ((op.permission & C.Permission.Admin.User.delete) == 0) {
        return;
    }

    const id = Number(fd.get('id'));
    const user = await User.findByPk(id);

    if (!user) {
        return;
    }

    await user.destroy();

    revalidatePath('/admin/users');
}

export async function ResetAccessKey(fd: FormData) {
    const op = await authByCookies(cookies());

    if (!op) return;

    if ((op.permission & C.Permission.Admin.User.edit) == 0) {
        return;
    }

    const id = Number(fd.get('id'));
    const user = await User.findByPk(id);
    
    if (!user) {
        return;
    }
    
    user.accessKey = crypto.randomBytes(32).toString('base64url');
    
    await user.save();

    revalidatePath('/admin');
    revalidatePath('/admin/users');
    revalidatePath('/admin/users/' + id.toString());
}
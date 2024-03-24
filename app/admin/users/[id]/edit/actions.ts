import { User } from "@/lib/db";
import bcrypt from 'bcrypt';
import { cookies } from "next/headers";

import { Permission } from "@/lib/constants";
import { authByCookies } from "@/lib/server-util";
import { saltRound } from "@/lib/constants";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function EditUser(fd: FormData) {
    'use server';
    const op = await authByCookies(cookies());

    if (!op) {
        return;
    }

    const id = fd.get('id');
    
    if (!id) return;

    const user = await User.findByPk(Number(id));

    if (!user) return;

    const username = fd.get('username');

    if (username && user.name != username) {
        user.name = username.toString();
    }

    const pswd = fd.get('password');

    if (pswd) {
        if ((op.permission & Permission.Admin.User.edit) == 0) return;

        const hash = bcrypt.hashSync(pswd.toString(), saltRound);
        user.passwordHash = hash;
    }

    const permission = fd.get('permission');

    if (permission) {
        if ((op.permission & Permission.Admin.User.assign) == 0) return;

        user.permission = Number(permission.toString());
    }

    await user.save();

    revalidatePath('/admin/users/');
    revalidatePath('/admin/users/' + id.toString());
    redirect('/admin/users/');
}
'use server';

import { prisma } from "@/lib/db";
import bcrypt from 'bcryptjs';
import { cookies } from "next/headers";

import { Permission } from "@/lib/constants";
import { authByCookies } from "@/lib/server-util";
import { saltRound } from "@/lib/constants";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function EditUser(fd: FormData) {
    const op = await authByCookies();

    if (!op) {
        return;
    }

    const id = fd.get('id');
    
    if (!id) return;

    const user = await prisma.user.findFirst({
        where: {
            id: Number(id)
        }
    });

    if (!user) return;

    const data: Record<string, any> = {};

    const username = fd.get('username');
    const password = fd.get('password');

    if (username && user.name != username) {
        data.name = username.toString();
    }
    
    if (password) {
        if ((op.permission & Permission.Admin.User.edit) == 0) return;

        const hash = bcrypt.hashSync(password.toString(), saltRound);
        data.passwordHash = hash;
    }

    const permission = fd.get('permission');

    if (permission) {
        if ((op.permission & Permission.Admin.User.assign) == 0) return;

        data.permission = Number(permission.toString());
    }

    await prisma.user.update({
        where: {
            id: Number(id)
        },
        data: data
    });

    revalidatePath('/admin/users/');
    revalidatePath('/admin/users/' + id.toString());
    redirect('/admin/users/');
}
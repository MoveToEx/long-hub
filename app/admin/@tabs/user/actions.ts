'use server';

import { prisma } from "@/lib/db";
import { auth } from '@/lib/dal';
import crypto from 'crypto';
import { revalidatePath } from "next/cache";
import * as C from '@/lib/constants';
import bcrypt from 'bcryptjs';

export async function DeleteUser(id: number) {
    const op = await auth();

    if (!op || (op.permission & C.Permission.Admin.User.delete) == 0) {
        return Promise.reject(new Error('Forbidden'));
    }

    if (op.id === id) {
        return Promise.reject(new Error('You cannot delete yourself'));
    }

    const user = await prisma.user.findFirst({
        where: {
            id
        }
    });

    if (!user) {
        return Promise.reject(new Error('Invalid user ID'));
    }

    await prisma.user.delete({
        where: {
            id
        }
    });

    revalidatePath('/admin/user');
}

export async function ResetAccessKey(id: number) {
    const op = await auth();

    if (!op || (op.permission & C.Permission.Admin.User.edit) == 0) {
        return;
    }

    const user = await prisma.user.findFirst({
        where: {
            id: id
        }
    });

    if (!user) {
        return;
    }

    await prisma.user.update({
        where: {
            id: id
        },
        data: {
            accessKey: crypto.randomBytes(32).toString('base64url')
        }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/user');
}

export async function EditUser(updatedRow: any, originalRow: any) {
    const op = await auth();

    if (!op || (op.permission & C.Permission.Admin.User.edit) == 0) {
        return Promise.reject(new Error('Forbidden'));
    }
    
    const id = originalRow.id as number;
    
    if (originalRow.permission !== updatedRow.permission) {
        if ((op.permission & C.Permission.Admin.User.assign) === 0) {
            return Promise.reject(new Error('Forbidden'));
        }
    }

    const row = await prisma.user.update({
        where: {
            id
        },
        data: {
            name: updatedRow.name,
            permission: updatedRow.permission
        }
    });

    return row;
}
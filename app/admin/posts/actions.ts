'use server';

import { prisma } from "@/lib/db";

import { authByCookies } from "@/lib/server-util";
import { cookies } from "next/headers";

import * as C from '@/lib/constants';
import { revalidatePath } from "next/cache";

export async function EditPost(updatedRow: any, originalRow: any) {
    const user = await authByCookies(cookies());

    if (!user || (user.permission & C.Permission.Admin.Post.edit) == 0) {
        return {
            ok: false,
            message: 'Forbidden'
        };
    }

    if (updatedRow.uploaderId != originalRow.uploaderId) {
        const count = await prisma.user.count({
            where: {
                id: updatedRow.uploaderId
            }
        });

        if (count == 0) {
            return {
                ok: false,
                message: 'Invalid uploader ID'
            };
        }
    }

    await prisma.post.update({
        where: {
            id: originalRow.id as string
        },
        data: {
            text: updatedRow.text as string,
            aggr: updatedRow.aggr as number,
            uploaderId: updatedRow.uploaderId as number
        }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/posts');

    return {
        ok: true
    };
}


export async function DeletePost(id: string) {
    const op = await authByCookies(cookies());

    if (!op) return {
        ok: false,
        message: 'Invalid session'
    };

    if ((op.permission & C.Permission.Admin.Post.delete) == 0) {
        return {
            ok: false,
            message: 'Forbidden'
        };
    }

    const post = await prisma.post.findFirst({
        where: {
            id: id
        }
    });

    if (!post) {
        return {
            ok: false,
            message: 'Invalid post id'
        };
    }

    await prisma.post.delete({
        where: {
            id: id
        }
    });
    
    revalidatePath('/admin/posts');

    return {
        ok: true
    };
}
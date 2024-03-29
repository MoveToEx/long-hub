'use server';

import { prisma } from "@/lib/db";

import { authByCookies } from "@/lib/server-util";
import { cookies } from "next/headers";

import * as C from '@/lib/constants';
import { revalidatePath } from "next/cache";


export async function DeletePost(fd: FormData) {
    const op = await authByCookies(cookies());

    if (!op) return;

    if ((op.permission & C.Permission.Admin.Post.delete) == 0) {
        return;
    }

    const id = fd.get('id')?.toString();

    if (!id) return;

    const post = await prisma.post.findFirst({
        where: {
            id: id
        }
    });

    if (!post) return;

    await prisma.post.delete({
        where: {
            id: id
        }
    });
    
    revalidatePath('/admin/posts');
}
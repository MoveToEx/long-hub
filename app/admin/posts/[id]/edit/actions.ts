'use server';

import { prisma } from "@/lib/db";
import { authByCookies } from "@/lib/server-util";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import * as C from '@/lib/constants';

export async function EditPost(fd: FormData) {
    const op = await authByCookies(cookies());

    if (!op || (op.permission & C.Permission.Post.edit) == 0) {
        return;
    }

    const id = fd.get('id');
    
    if (!id) return;

    const post = await prisma.post.findFirst({
        where: {
            id: id.toString()
        }
    });

    if (!post) {
        return;
    }

    const text = fd.get('text');
    const aggr = fd.get('aggr');

    const uploaderId = fd.get('uploaderId');

    if (uploaderId && (op.permission & C.Permission.Admin.Post.edit) == 0) return;

    await prisma.post.update({
        where: {
            id: id.toString(),
        },
        data: {
            text: text?.toString() ?? '',
            aggr: Number(aggr?.toString() ?? '1'),
            uploaderId: Number(uploaderId?.toString() ?? post.uploaderId)
        }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/posts');
    revalidatePath('/admin/posts/' + id);

    redirect('/admin/posts');
}
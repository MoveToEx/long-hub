'use server';

import { Post, User } from "@/lib/db";
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
    
    if (!id) {
        return;
    }

    const post = await Post.findByPk(id.toString());

    if (!post) {
        return;
    }

    const text = fd.get('text');

    if (text) {
        post.text = text.toString();
    }

    const aggr = fd.get('aggr');

    if (aggr) {
        post.aggr = Number(aggr.toString());
    }

    const uploaderId = fd.get('uploaderId');

    if (uploaderId) {
        if ((op.permission & C.Permission.Admin.Post.transfer) == 0) return;

        const uploader = await User.findByPk(Number(uploaderId.toString()));

        if (!uploader) return;

        await post.setUploader(uploader);
    }

    await post.save();

    revalidatePath('/admin');
    revalidatePath('/admin/posts');
    revalidatePath('/admin/posts/' + id);

    redirect('/admin/posts');
}
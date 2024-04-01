'use server';

import { prisma } from "@/lib/db";
import { authByCookies } from "@/lib/server-util";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import * as C from '@/lib/constants';

export async function MigratePosts(_state: any, fd: FormData) {
    const user = await authByCookies(cookies());

    if (!user) {
        return 'Unauthorized';
    }

    if ((user.permission & C.Permission.Admin.Post.edit) == 0) {
        return 'Forbidden';
    }

    const fromName = fd.get('from')?.toString();
    const toName = fd.get('to')?.toString();
    const delSource = fd.get('delete-source')?.toString();

    if (!fromName || !toName) {
        return 'Missing parameters';
    }

    if (!toName.match(/^[a-zA-Z0-9_]+$/)) {
        return 'Illegal tag name';
    }

    let to = await prisma.tag.findFirst({
        where: {
            name: toName
        }
    });

    if (!to) {
        to = await prisma.tag.create({
            data: {
                name: toName
            }
        });
    }

    const from = await prisma.tag.findFirst({
        where: {
            name: fromName
        },
        include: {
            posts: true
        }
    });

    if (!from) {
        return;
    }

    const posts = await prisma.post.findMany({
        include: {
            tags: true
        },
        where: {
            tags: {
                some: {
                    id: from.id
                }
            }
        }
    });
    
    for (const post of posts) {
        await prisma.post.update({
            where: {
                id: post.id
            },
            data: {
                tags: {
                    disconnect: {
                        id: from.id
                    },
                    connect: {
                        id: to.id
                    }
                }
            }
        });
    }

    if (delSource == 'on') {
        await prisma.tag.delete({
            where: {
                id: from.id
            }
        });
    }

    revalidatePath('/admin');
    revalidatePath('/admin/tags');
}

export async function EditTag(updatedRow: any, originalRow: any) {
    const user = await authByCookies(cookies());

    if (!user || (user.permission & C.Permission.Admin.Post.edit) == 0) {
        return Promise.resolve(originalRow);
    }

    if (await prisma.tag.count({
        where: {
            name: updatedRow.name as string
        }
    })) {
        return Promise.resolve(originalRow);
    }

    await prisma.tag.update({
        where: {
            id: originalRow.id as number
        },
        data: {
            name: updatedRow.name as string
        }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/tags');

    return Promise.resolve(updatedRow);
}
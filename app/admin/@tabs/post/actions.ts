'use server';

import { prisma } from "@/lib/db";

import { auth } from '@/lib/dal';

import * as C from '@/lib/constants';
import { revalidatePath } from "next/cache";
import { Rating, RequestStatus } from "@prisma/client";

export async function EditPost(updatedRow: any, originalRow: any) {
    const user = await auth();

    if (!user || (user.permission & C.Permission.Admin.Post.edit) == 0) {
        return Promise.reject(new Error('Forbidden'));
    }

    if (updatedRow.rating != originalRow.rating && !Object.values(Rating).includes(updatedRow.rating)) {
        return Promise.reject(new Error('Invalid rating'));
    }

    if (updatedRow.uploaderId != originalRow.uploaderId) {
        const count = await prisma.user.count({
            where: {
                id: updatedRow.uploaderId
            }
        });

        if (count == 0) {
            return Promise.reject(new Error('Invalid uploader ID'));
        }
    }

    const row = await prisma.post.update({
        where: {
            id: originalRow.id as string
        },
        data: {
            deletedAt: updatedRow.deletedAt,
            deletionReason: updatedRow.deletionReason,
            text: updatedRow.text,
            rating: updatedRow.rating,
            uploaderId: updatedRow.uploaderId
        },
        include: {
            uploader: {
                select: {
                    name: true
                }
            }
        }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/posts');

    return row;
}


export async function DeletePost(id: string, reason: string) {
    const op = await auth();

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

    if (!post || post.deletedAt !== null) {
        return {
            ok: false,
            message: 'Invalid post id'
        };
    }

    await prisma.post.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletionReason: reason
        }
    })

    revalidatePath('/admin/posts');

    return {
        ok: true
    };
}



export async function RecoverPost(id: string) {
    const op = await auth();

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

    if (!post || post.deletedAt === null) {
        return {
            ok: false,
            message: 'Invalid post id'
        };
    }

    await prisma.$transaction([
        prisma.post.update({
            where: { id },
            data: {
                deletedAt: null,
                deletionReason: null
            }
        }),
        prisma.deletion_request.updateMany({
            where: {
                postId: id,
                status: RequestStatus.approved
            },
            data: {
                status: RequestStatus.revoked,
                processedAt: new Date()
            }
        })
    ]);

    revalidatePath('/admin/posts');

    return {
        ok: true
    };
}
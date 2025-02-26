'use server';

import { prisma } from "@/lib/db";
import { RequestStatus } from "@prisma/client";
import { auth } from "@/lib/dal";
import * as C from '@/lib/constants';
import { revalidatePath } from "next/cache";

export async function ApproveRequest(id: number) {
    const user = await auth();

    if (!user || (user.permission & C.Permission.Admin.Post.edit) == 0) {
        return Promise.reject(new Error('Forbidden'));
    }

    const req = await prisma.deletion_request.findFirst({
        where: { id }
    });

    if (req === null) {
        return Promise.reject(new Error('Invalid request'));
    }

    await prisma.$transaction([
        prisma.post.update({
            where: {
                id: req.postId
            },
            data: {
                deletedAt: new Date(),
                deletionReason: req.reason,
                updatedAt: new Date()
            }
        }),
        prisma.deletion_request.updateMany({
            where: {
                postId: req.postId,
                status: RequestStatus.pending,
            },
            data: {
                processedAt: new Date(),
                status: RequestStatus.dismissed
            }
        }),
        prisma.deletion_request.update({
            where: { id },
            data: {
                processedAt: new Date(),
                status: RequestStatus.approved
            }
        })
    ]);

    revalidatePath('/admin/deletion_requests');
}

export async function DismissRequest(id: number) {
    const user = await auth();

    if (!user || (user.permission & C.Permission.Admin.Post.edit) == 0) {
        return Promise.reject(new Error('Forbidden'));
    }

    const req = await prisma.deletion_request.findFirst({
        where: { id }
    });

    if (req === null) {
        return Promise.reject(new Error('Invalid request'));
    }

    await prisma.deletion_request.update({
        where: { id },
        data: {
            processedAt: new Date(),
            status: RequestStatus.dismissed
        }
    });

    revalidatePath('/admin/deletion_requests');
}

export async function RevokeRequest(id: number) {
    const user = await auth();

    if (!user || (user.permission & C.Permission.Admin.Post.edit) == 0) {
        return Promise.reject(new Error('Forbidden'));
    }

    const req = await prisma.deletion_request.findFirst({
        where: { id }
    });

    if (req === null) {
        return Promise.reject(new Error('Invalid request'));
    }

    await prisma.$transaction([
        prisma.post.update({
            where: {
                id: req.postId
            },
            data: {
                deletedAt: null,
                deletionReason: null,
                updatedAt: new Date()
            }
        }),
        prisma.deletion_request.update({
            where: { id },
            data: {
                processedAt: new Date(),
                status: RequestStatus.revoked
            }
        })
    ]);

    revalidatePath('/admin/deletion_requests');
}

export async function SetRequestStatus(id: number, status: RequestStatus) {
    const user = await auth(C.Permission.Admin.Post.edit);

    if (!user) {
        return Promise.reject(new Error('Forbidden'));
    }

    await prisma.deletion_request.update({
        where: {
            id
        },
        data: {
            status,
            processedAt: new Date()
        }
    });
}
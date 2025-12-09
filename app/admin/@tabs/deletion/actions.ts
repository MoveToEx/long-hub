'use server';

import { prisma } from '@/lib/db';
import { RequestStatus } from "@/lib/schema";
import { auth } from "@/lib/dal";
import * as C from '@/lib/constants';
import { revalidatePath } from "next/cache";

function revalidate() {
    revalidatePath('/admin/deletion');
    revalidatePath('/admin/post');
    revalidatePath('/admin/');
}

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
                deletionReason: req.reason
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
    revalidate();
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

    revalidate();
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
                deletionReason: null
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

    revalidate();
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

    revalidate();
}
'use server';

import { auth } from '@/lib/dal';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { RequestStatus } from '@prisma/client';

export async function SubmitRequest(state: string, fd: FormData) {
    const postId = fd.get('request-post-id')?.toString();
    const reqType = fd.get('request-type')?.toString();
    const reqDetail = fd.get('request-details')?.toString();

    const user = await auth();

    if (user === null) return 'User not logged in';
    if (!postId) return 'Unexpected error';
    if (reqType === undefined) return 'Invalid request type';

    const reason = reqType + (reqDetail ? ': ' + reqDetail : '');

    const post = await prisma.post.findFirst({
        where: {
            id: postId
        }
    });

    if (post === null) return 'Invalid post';
    if (post.deletedAt !== null) return 'Post already deleted';

    const req = await prisma.deletion_request.findFirst({
        where: {
            postId,
            userId: user.id
        }
    });

    if (req !== null) {
        await prisma.deletion_request.update({
            where: {
                id: req.id
            },
            data: {
                reason,
                createdAt: new Date(),
                status: RequestStatus.pending,
                processedAt: null
            }
        });
        return redirect(`/post/${postId}`);
    }

    await prisma.deletion_request.create({
        data: {
            userId: user.id,
            postId,
            reason,
        }
    });

    return redirect(`/post/${postId}`);
}
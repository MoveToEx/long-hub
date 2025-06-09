'use server';

import { prisma } from "@/lib/db";

import { auth } from '@/lib/dal';

import * as C from '@/lib/constants';
import { revalidatePath } from "next/cache";
import { Prisma, Rating, RequestStatus } from "@prisma/client";
import { GridGetRowsParams, GridGetRowsResponse } from "@mui/x-data-grid";
import _ from "lodash";

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
    revalidatePath('/admin/post');

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

    revalidatePath('/admin/post');

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

    revalidatePath('/admin/post');

    return {
        ok: true
    };
}

type PostArg = Prisma.Args<typeof prisma.post, 'findMany'>;

export async function getRows(params: GridGetRowsParams): Promise<GridGetRowsResponse> {
    const op = await auth();
    if (!op) {
        return Promise.reject(new Error('Unauthenticated'));
    }
    if ((op.permission & C.Permission.Admin.base) == 0) {
        return Promise.reject(new Error('Forbidden'));
    }

    if (typeof params.start !== 'number' || typeof params.end !== 'number') {
        return Promise.reject(new Error('Unrecognized pagination'));
    }

    const orderBy: Prisma.Args<typeof prisma.post, 'findMany'>['orderBy'] = {};
    const where: PostArg['where'] = {};
    for (const item of params.sortModel) {
        if (!item.sort) {
            continue;
        }
        orderBy[item.field as keyof typeof orderBy] = item.sort;
    }

    for (const item of params.filterModel.items) {
        let opt = {};
        if (item.operator.startsWith('$')) {
            const type = item.operator.slice(1);
            if (type === 'null') {
                opt = {
                    [item.field]: null
                };
            }
            else if (type === 'not_null') {
                opt = {
                    [item.field]: {
                        not: null
                    }
                };
            }
        }
        else {
            opt = {
                [item.field]: {
                    [item.operator]: item.value
                }
            }
        }
        if (_.isEmpty(opt)) {
            return Promise.reject(new Error('Unknown operator: ' + item.operator));
        }
        _.merge(where, opt);
    }

    if (params.filterModel.quickFilterValues) {
        for (const item of params.filterModel.quickFilterValues) {
            if (/^[0-9a-fA-F\-]+$/.test(item)) {
                const uuid = item.replaceAll('-', '').toLowerCase();
                const bits = 32 - uuid.length;
                _.merge(where, {
                    id: {
                        gte: uuid + _.repeat('0', bits),
                        lte: uuid + _.repeat('f', bits)
                    }
                });
            }
            else {
                _.merge(where, {
                    text: {
                        contains: item
                    }
                });
            }
        }
    }

    const [count, result] = await prisma.$transaction([
        prisma.post.count({ where }),
        prisma.post.findMany({
            skip: params.start,
            take: params.end - params.start + 1,
            orderBy,
            where,
            include: {
                uploader: true
            }
        })
    ]);


    return {
        rows: result,
        rowCount: count
    }
}
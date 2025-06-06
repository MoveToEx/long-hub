import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from '@/lib/dal';
import * as C from '@/lib/constants';
import { revalidatePath } from "next/cache";
import { z } from 'zod';
import _ from 'lodash';
import { responses } from "@/lib/server-util";
import { Prisma, Rating } from "@prisma/client";

const updateSchema = z.object({
    text: z.optional(z.string()),
    rating: z.optional(z.nativeEnum(Rating)),
    tags: z.optional(z.array(z.string()))
});

const deleteSchema = z.object({
    reason: z.string().default('')
});

export async function GET(req: NextRequest, {
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    if (!z.string().uuid().safeParse(id).success) {
        return NextResponse.json({
            error: 'Unknown ID format'
        }, {
            status: 400
        });
    }

    const post = await prisma.post.findFirst({
        where: {
            id
        },
        include: {
            tags: true,
            uploader: {
                select: {
                    name: true,
                    id: true
                }
            },
            deletion_requests: {
                include: {
                    user: {
                        select: {
                            name: true,
                            id: true
                        }
                    }
                }
            }
        }
    });

    if (!post) {
        return responses.notFound('Post ' + id);
    }

    return NextResponse.json(post);
}

export async function PUT(req: NextRequest, {
    params
}: {
    params: Promise<{ id: string }>
}) {
    const user = await auth();

    if (!user) {
        return responses.unauthorized();
    }

    if ((user.permission & C.Permission.Post.edit) == 0) {
        return responses.forbidden();
    }

    const { id } = await params;

    if (!z.string().uuid().safeParse(id).success) {
        return NextResponse.json({
            error: 'Unknown ID format'
        }, {
            status: 400
        });
    }

    const post = await prisma.post.findFirst({
        where: { id }
    });

    if (post === null) {
        return responses.notFound('Post ' + id);
    }

    if (post.deletedAt !== null) {
        return new Response('post deleted', {
            status: 409
        });
    }

    const data: Prisma.Args<typeof prisma.post, 'update'>['data'] = {};
    const transactions: Prisma.PrismaPromise<any>[] = [];
    const { data: meta, error } = updateSchema.safeParse(await req.json());

    if (error) {
        return NextResponse.json(error.errors, {
            status: 400
        });
    }

    if (meta.rating !== undefined) {
        data.rating = meta.rating;
    }
    if (meta.text !== undefined) {
        data.text = meta.text;

        if (data.text !== meta.text) {
            transactions.push(
                prisma.$queryRaw(Prisma.sql`
                    UPDATE post SET "embedding" = NULL WHERE "id" = ${id}`)
            );
        }
    }
    if (meta.tags !== undefined) {
        transactions.push(prisma.post.update({
            where: { id },
            data: {
                tags: {
                    set: []
                }
            }
        }));

        data.tags = {
            connectOrCreate: meta.tags.map(name => ({
                where: { name },
                create: { name }
            }))
        };
    }

    const result = _.last(await prisma.$transaction([
        ...transactions,
        prisma.post.update({
            where: { id },
            data: {
                ...data
            }
        }),
        prisma.post.findFirst({
            where: { id },
            include: {
                tags: true,
                uploader: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
    ]));

    revalidatePath('/admin');
    revalidatePath('/admin/posts');

    return NextResponse.json(result);
}

export async function DELETE(req: NextRequest, {
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    if (!z.string().uuid().safeParse(id).success) {
        return NextResponse.json({
            error: 'Unknown ID format'
        }, {
            status: 400
        });
    }

    const user = await auth();

    if (!user) {
        return responses.unauthorized();
    }

    if ((user.permission & C.Permission.Admin.Post.delete) == 0) {
        return responses.forbidden();
    }

    const { data, error } = deleteSchema.safeParse(await req.json());

    if (error) {
        return NextResponse.json(error.errors, {
            status: 400
        });
    }

    const post = await prisma.post.findFirst({
        where: { id }
    });

    if (!post || post.deletedAt !== null) {
        return responses.notFound('Post ' + id);
    }

    await prisma.post.update({
        where: { id },
        data: {
            deletedAt: new Date(),
            deletionReason: data.reason
        }
    });

    return new NextResponse(null, {
        status: 204
    });
}
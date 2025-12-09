import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";
import _ from 'lodash';
import { z } from 'zod';
import { responses, zjson } from '@/lib/server-util';
import { auth } from '@/lib/dal';
import { Permission } from '@/lib/constants';
import { Rating, Status, UploadSessionStatus } from '@/lib/schema';
import { revalidatePath } from 'next/cache';
import env from '@/lib/env';
import s3 from '@/lib/s3';
import worker from '@/lib/worker';

const schema = z.object({
    id: z.guid(),
    metadata: z.object({
        text: z.string().default(''),
        tags: z.string().array().default([]),
        rating: z.enum(Rating).default(Rating.none),
    })
});

export async function POST(req: NextRequest) {
    const user = await auth();

    if (user === null) {
        return responses.unauthorized();
    }

    if ((user.permission & Permission.Post.new) == 0) {
        return responses.forbidden();
    }

    const { data, error } = zjson.pipe(schema).safeParse(await req.text());

    if (error) {
        return NextResponse.json({
            message: 'Invalid request',
            error: z.treeifyError(error)
        }, {
            status: 400
        });
    }

    const session = await prisma.upload_session.findFirst({
        where: {
            id: data.id
        }
    });

    if (!session) {
        return NextResponse.json({
            message: 'Unknown id'
        }, {
            status: 409
        });
    }

    if (session.status !== UploadSessionStatus.active) {
        return NextResponse.json({
            message: 'Session claimed'
        }, {
            status: 409
        });
    }

    if (!(await s3.exists(session.key))) {
        return NextResponse.json({
            message: 'Object does not exist'
        }, {
            status: 409
        });
    }

    await prisma.post.create({
        data: {
            id: data.id,
            text: data.metadata.text,
            rating: data.metadata.rating,
            imageURL: env.S3_PREFIX + session.key,
            status: Status.active,
            uploader: {
                connect: {
                    id: user.id
                }
            },
            tags: {
                connectOrCreate: data.metadata.tags.map(name => ({
                    where: { name },
                    create: { name }
                }))
            }
        }
    });

    await prisma.upload_session.update({
        where: {
            id: data.id
        },
        data: {
            status: UploadSessionStatus.claimed
        }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/post');

    await worker.embedding(data.id);
    await worker.hash(data.id);

    return NextResponse.json({
        id: data.id
    }, {
        status: 201
    });
}
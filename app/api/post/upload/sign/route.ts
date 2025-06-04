import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";
import _ from 'lodash';
import client from '@/lib/s3';
import mime from 'mime-types';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';
import { responses, zjson } from '@/lib/server-util';
import { auth } from '@/lib/dal';
import { Permission } from '@/lib/constants';
import worker from '@/lib/worker';
import { get } from '@/lib/config';
import { subMinutes } from 'date-fns';

const schema = z.object({
    mime: z.enum(['image/png', 'image/webp', 'image/jpeg', 'image/gif'])
});

export async function POST(req: NextRequest) {
    const user = await auth();

    if (user === null) {
        return responses.unauthorized();
    }

    if ((user.permission & Permission.Post.new) == 0) {
        return responses.forbidden();
    }

    const limit = await get('maxUploadRate');
    const count = await prisma.upload_session.count({
        where: {
            userId: user.id,
            createdAt: {
                gt: subMinutes(new Date(), 1)
            }
        }
    });

    if (count >= limit) {
        return NextResponse.json({
            message: 'Rate limit excceeded'
        }, {
            status: 429
        });
    }

    const { data, error } = zjson.pipe(schema).safeParse(await req.text());

    if (error) {
        return NextResponse.json({
            message: 'Invalid request',
            error: error.flatten()
        }, {
            status: 400
        });
    }
    
    const ext = mime.extension(data.mime);
    if (ext === false) {
        return NextResponse.json({
            message: 'Invalid MIME type',
            error: []
        }, {
            status: 400
        });
    }

    const id = uuid();
    const filename = id + '.' + ext;
    const key = 'post/' + filename;
    const url = await client.presign(key, data.mime);

    await prisma.upload_session.create({
        data: {
            id,
            key,
            user: {
                connect: {
                    id: user.id
                }
            }
        }
    });

    await worker.recycle(id, await get('uploadSessionExpiration'));

    return NextResponse.json({
        id,
        url
    });
}
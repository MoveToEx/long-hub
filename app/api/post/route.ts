import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";
import sharp from 'sharp';
import { Readable } from 'stream';
import _ from 'lodash';
import fs from 'fs';
import path from 'node:path';
import crypto from 'crypto';
import mime from 'mime-types';
import { z } from 'zod';
import { parseWithZod } from '@conform-to/zod';
import phash from 'sharp-phash';
import phashDistance from 'sharp-phash/distance';
import env from '@/lib/env';
import { responses } from '@/lib/server-util';
import { auth } from '@/lib/dal';
import { Permission } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { Rating } from '@prisma/client';

const json = z.string().transform((value, context) => {
    try {
        return JSON.parse(value);
    }
    catch (e) {
        context.addIssue({
            code: 'custom',
            message: 'Invalid JSON'
        });
        return z.NEVER;
    }
});

const schema = z.object({
    text: z.string().default(''),
    rating: z.nativeEnum(Rating).default(Rating.none),
    tags: z.array(z.string()).default([])
});

const postSchema = z.object({
    image: z.instanceof(File),
    metadata: json.pipe(schema),
    force: z.coerce.boolean()
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 24);

    const [posts, count] = await prisma.$transaction([
        prisma.post.findMany({
            orderBy: [
                {
                    createdAt: 'desc',
                },
                {
                    id: 'asc'
                }
            ],
            include: {
                tags: true,
                uploader: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            skip: offset,
            take: limit
        }),
        prisma.post.count()
    ])

    return NextResponse.json({
        count: count,
        data: posts
    });
}

export async function POST(req: NextRequest) {
    const user = await auth(req);

    if (user === null) {
        return responses.unauthorized();
    }

    if ((user.permission & Permission.Post.new) == 0) {
        return responses.forbidden();
    }

    const form = parseWithZod(await req.formData(), {
        schema: postSchema
    });

    if (form.status !== 'success') {
        return NextResponse.json(form.reply(), {
            status: 400
        });
    }

    const { image, metadata, force } = form.value;

    let buffer = Buffer.from(await image.arrayBuffer());

    if (image.type != 'image/gif') {
        buffer = await sharp(buffer).trim({
            background: 'rgba(255,255,255,0.0)'
        }).trim().toBuffer();
    }

    const hash: string = await phash(buffer);

    const similar = await prisma.post.findMany({
        select: {
            id: true,
            imageHash: true,
            image: true,
            imageURL: true
        }
    }).then(posts => posts.filter(post => phashDistance(post.imageHash, hash) < 4));

    if (similar.length && !force) {
        return NextResponse.json(similar, {
            status: 409
        });
    }

    const id = crypto.randomUUID();
    const filename = id + '.' + mime.extension(image.type);

    const post = await prisma.post.create({
        data: {
            id: id,
            createdAt: new Date(),
            updatedAt: new Date(),
            text: metadata.text,
            rating: metadata.rating,
            image: filename,
            imageHash: hash,
            uploader: {
                connect: {
                    id: user.id
                }
            },
            tags: {
                connectOrCreate: metadata.tags.map(name => ({
                    where: { name },
                    create: { name }
                }))
            }
        }
    });

    await fs.promises.writeFile(path.join(env.MEDIA_ROOT, 'posts', filename), Readable.from(buffer));

    revalidatePath('/admin');
    revalidatePath('/admin/posts');

    return NextResponse.json(post, {
        status: 201
    });
}
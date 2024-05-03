import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";
import sharp from 'sharp';
import Color from 'color';
import _ from 'lodash';
import fs from 'fs';
import path from 'node:path';
import crypto from 'crypto';

// @ts-expect-error
import phash from 'sharp-phash';

// @ts-expect-error
import phashDistance from 'sharp-phash/distance';
import { auth } from '@/lib/server-util';
import { cookies } from 'next/headers';
import { Permission } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 24);

    const posts = await prisma.post.findMany({
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
    });

    const count = await prisma.post.count();

    return NextResponse.json({
        count: count,
        data: posts
    });
}

export async function POST(req: NextRequest) {
    if (process.env.MEDIA_ROOT === undefined) {
        return NextResponse.json('MEDIA_ROOT env not found on server', {
            status: 500
        });
    }

    const user = await auth(req, cookies());

    if (user === null) {
        return NextResponse.json('unauthorized', {
            status: 401
        });
    }

    if ((user.permission & Permission.Post.new) == 0) {
        return NextResponse.json('operation not permitted', {
            status: 403
        });
    }

    const fd = await req.formData();

    const img = fd.get('image') as File;
    const _metadata = fd.get('metadata') as string;
    const force = Number.parseInt(fd.get('force') as string | null ?? '0');

    let metadata;

    if (!_metadata || !img) {
        return NextResponse.json('insufficient parameters', {
            status: 400
        });
    }

    try {
        metadata = JSON.parse(_metadata);
    }
    catch (e) {
        return NextResponse.json('failed to parse JSON', {
            status: 400
        });
    }

    var buffer = Buffer.from(await img.arrayBuffer());

    if (img.type != 'image/gif') {
        buffer = await sharp(buffer).trim({
            background: 'rgba(255,255,255,0.0)'
        }).toBuffer();
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
    const filename = id + '.' + _.last(img.name.split('.'));

    const tags = [];

    for (const tagName of metadata.tags) {
        const tag = await prisma.tag.findFirst({
            where: {
                name: tagName
            }
        });

        if (tag) {
            tags.push({
                id: tag.id
            });
        }
        else {
            tags.push(await prisma.tag.create({
                data: {
                    name: tagName
                }
            }));
        }
    }

    const post = await prisma.post.create({
        data: {
            id: id,
            createdAt: new Date(),
            updatedAt: new Date(),
            text: metadata.text,
            aggr: metadata.aggr,
            image: filename,
            imageHash: await phash(buffer),
            uploaderId: user.id,
            tags: {
                connect: tags
            }
        }
    });

    fs.writeFileSync(path.join(process.env.MEDIA_ROOT, 'posts', filename), buffer);

    revalidatePath('/admin');
    revalidatePath('/admin/post');

    return NextResponse.json(post);
}
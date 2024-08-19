import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";
import sharp from 'sharp';
import Color from 'color';
import _ from 'lodash';
import fs from 'fs';
import path from 'node:path';
import crypto from 'crypto';
import { z } from 'zod';

// @ts-expect-error
import phash from 'sharp-phash';

// @ts-expect-error
import phashDistance from 'sharp-phash/distance';
import { auth, formatZodError, responses } from '@/lib/server-util';
import { cookies } from 'next/headers';
import { Permission } from '@/lib/constants';
import { revalidatePath } from 'next/cache';
import { Rating } from '@prisma/client';

const schema = z.object({
    text: z.string(),
    rating: z.nativeEnum(Rating),
    tags: z.array(z.string())
});

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
        return new Response('MEDIA_ROOT env not found on server', {
            status: 500
        });
    }

    const user = await auth(req, cookies());

    if (user === null) {
        return responses.unauthorized();
    }

    if ((user.permission & Permission.Post.new) == 0) {
        return responses.forbidden();
    }

    const fd = await req.formData();

    const img = fd.get('image') as File;
    const _metadata = fd.get('metadata') as string;
    const force = Number.parseInt(fd.get('force')?.toString() ?? '0');

    let raw;

    if (!_metadata) {
        return new Response('Metadata field not found', {
            status: 400
        });
    }

    if (!img) {
        return new Response('Image not found', {
            status: 400
        });
    }

    try {
        raw = JSON.parse(_metadata);
    }
    catch (e) {
        return new Response('Failed when parsing JSON', {
            status: 400
        });
    }

    const { data: metadata, error } = schema.safeParse(raw);

    if (error) {
        return new Response(formatZodError(error), {
            status: 400
        });
    }

    var buffer = Buffer.from(await img.arrayBuffer());

    if (img.type != 'image/gif') {
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
    const filename = id + '.' + _.last(img.name.split('.'));

    const tags = await Promise.all(
        metadata.tags.map(async name => prisma.tag.upsert({
            where: { name },
            create: { name },
            update: {}
        }))
    );
    
    const post = await prisma.post.create({
        data: {
            id: id,
            createdAt: new Date(),
            updatedAt: new Date(),
            text: metadata.text,
            rating: metadata.rating,
            image: filename,
            imageHash: hash,
            uploaderId: user.id,
            tags: {
                connect: tags
            }
        }
    });

    await fs.promises.writeFile(path.join(process.env.MEDIA_ROOT, 'posts', filename), buffer);

    revalidatePath('/admin');
    revalidatePath('/admin/posts');

    return NextResponse.json(post, {
        status: 201
    });
}
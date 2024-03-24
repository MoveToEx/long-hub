import { Post, Tag } from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";
import sharp from 'sharp';
import Color from 'color';
import _ from 'lodash';
import fs from 'fs';
import path from 'node:path';

// @ts-expect-error
import phash from 'sharp-phash';

// @ts-expect-error
import phashDistance from 'sharp-phash/distance';
import { auth } from '@/lib/server-util';
import { cookies } from 'next/headers';
import { Permission } from '@/lib/constants';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 24);

    const posts = await Post.findAll({
        order: [
            ['createdAt', 'DESC']
        ],
        include: {
            model: Tag,
            through: {
                attributes: []
            }
        },
        offset: offset,
        limit: limit
    });

    return NextResponse.json({
        count: await Post.count(),
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

    const similar = await Post.findAll({
        attributes: ['id', 'imageHash', 'image', 'imageURL']
    }).then(posts => posts.filter(post => phashDistance(post.imageHash, hash) < 4));

    if (similar.length && !force) {
        return NextResponse.json(similar.map(post => post.toJSON()), {
            status: 409
        });
    }

    const post = Post.build({
        text: metadata.text,
        aggr: metadata.aggr,
        imageHash: await phash(buffer)
    });

    const filename = post.id + '.' + _.last(img.name.split('.'));

    fs.writeFileSync(path.join(process.env.MEDIA_ROOT, 'posts', filename), buffer);

    post.image = filename;

    await post.save();

    await post.setUploader(user);

    if (metadata.tags !== undefined) {
        for (const _tag of metadata.tags) {
            const [tag, _created] = await Tag.findOrCreate({
                where: {
                    name: _tag
                },
                defaults: {
                    name: _tag
                }
            });

            await post.addTag(tag);
        }
    }

    return NextResponse.json(post.toJSON());
}
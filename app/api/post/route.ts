import { Post, Tag } from '@/lib/db';
import { NextRequest, NextResponse } from "next/server";
import sharp from 'sharp';
import Color from 'color';
import _ from 'lodash';
import fs from 'fs';
import path from 'node:path';

// @ts-expect-error
import phash from 'sharp-phash';

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
        offset: offset
    }).then(x => x.slice(0, limit));

    return NextResponse.json({
        count: await Post.count(),
        data: posts
    });
}

export async function POST(req: NextRequest) {
    if (process.env.MEDIA_ROOT === undefined) {
        return NextResponse.json('MEDIA_ROOT env not found', {
            status: 500
        });
    }
    const fd = await req.formData();

    const img = fd.get('image') as File;

    if (!img) {
        return NextResponse.json('image not present in form data', {
            status: 400
        });
    }
    var post = Post.build();
    var buffer = Buffer.from(await img.arrayBuffer());

    if (img.type != 'image/gif') {
        buffer = await sharp(buffer).trim({
            background: 'rgba(255,255,255,0.0)'
        }).toBuffer();
    }

    const filename = post.getDataValue('id') + '.' + _.last(img.name.split('.'));

    fs.writeFileSync(path.join(process.env.MEDIA_ROOT, 'posts', filename), buffer);

    post.imageHash = await phash(buffer);
    post.image = filename;

    post.save();

    return NextResponse.json({
        id: post.id
    }, {
        status: 201
    });
}
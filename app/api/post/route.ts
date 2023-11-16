import { NextResponse, NextRequest } from "next/server";
import _ from 'lodash';
import { Post, Tag } from "@/lib/db";
import fs from 'fs';
// @ts-expect-error -- upstream types do not exist: https://github.com/btd/sharp-phash/issues/14
import phash from "sharp-phash";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const offset = Number(searchParams.get('offset') ?? 0);
    const limit = Number(searchParams.get('limit') ?? 24);

    const posts = await Post.findAll({
        order: [
            [ 'createdAt', 'DESC' ]
        ],
        include: {
            model: Tag,
            attributes: ['id', 'name'],
            through: {
                attributes: []
            }
        }
    }).then(x => x.slice(offset, offset + limit));

    return NextResponse.json({
        count: await Post.count(),
        data: posts
    });
}

export async function POST(req: NextRequest) {
    var fd = await req.formData();
    var img = fd.get('image') as File;

    if (!img) {
        return NextResponse.json({ error: 'image missing' }, { status: 400 });
    }
    try {
        var post = Post.build();
        const filename = '/upload/posts/' + (post as any).id + '.' + _.last(img.name.split('.'));
        const buffer = Buffer.from(await img.arrayBuffer());
        fs.writeFileSync(process.cwd() + filename, buffer, { flag: 'w' });

        (post as any).imageHash = await phash(buffer);
        (post as any).image = filename;
        
        post.save();
    }
    catch (e) {
        return NextResponse.json({ error: 'bad Request: ' + e }, { status: 400 });
    }
    return NextResponse.json({
        id: (post as any).id
    })
}
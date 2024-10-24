import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';
import _ from 'lodash';
import fs from 'fs';

import { auth } from "@/lib/server-util";
import * as C from '@/lib/constants';
import { cookies } from "next/headers";

export async function GET(req: NextRequest, {
    params
}: {
    params: Promise<{ name: string }>
}) {
    const { name } = await params;
    const template = await prisma.template.findFirst({
        where: {
            name
        }
    });

    if (!template) {
        return NextResponse.json(name + ' not found', {
            status: 404
        });
    }

    return NextResponse.json(template);
}

export async function POST(req: NextRequest, {
    params
}: {
    params: Promise<{ name: string }>
}) {
    if (process.env.MEDIA_ROOT === undefined) {
        return NextResponse.json('MEDIA_ROOT env not found', {
            status: 500
        });
    }
    const { name } = await params;
    if (await prisma.template.count({
        where: {
            name: name
        }
    })) {
        return NextResponse.json(name + ' already exists', {
            status: 409
        });
    }

    const user = await auth(req);

    if (user == null) {
        return NextResponse.json('unauthorized', {
            status: 401
        });
    }

    if ((user.permission & C.Permission.Template.new) == 0) {
        return NextResponse.json('forbidden', {
            status: 403
        });
    }

    const fd = await req.formData();

    if (!fd.has('image') || !fd.has('metadata')) {
        return NextResponse.json('insufficient parameters', {
            status: 400
        });
    }

    const img = fd.get('image') as File;
    const metadata = JSON.parse(fd.get('metadata') as string);

    if (img.type == 'image/gif') {
        return NextResponse.json('gif not supported for templates', {
            status: 400
        });
    }

    const filename = name + '.' + _.last(img.name.split('.'));
    const template = await prisma.template.create({
        data: {
            name: name,
            image: filename,
            createdAt: new Date(),
            uploaderId: user.id,
            rectHeight: metadata.height,
            rectWidth: metadata.width,
            offsetX: metadata.x,
            offsetY: metadata.y,
        },
    });

    var buffer = Buffer.from(await img.arrayBuffer());

    fs.writeFileSync(template.imagePath, new Uint8Array(buffer));

    return NextResponse.json({
        name: template.name
    }, {
        status: 201
    });
}

export async function PUT(req: NextRequest, {
    params
}: {
    params: Promise<{ name: string }>
}) {
    const { name } = await params;

    const template = await prisma.template.findFirst({
        where: {
            name
        }
    });
    const data = await req.json();

    if (!template) {
        return NextResponse.json(name + ' not found', {
            status: 404
        });
    }

    if ([data.height, data.width, data.x, data.y].some(x => x === undefined)) {
        return NextResponse.json('ill-formed request', {
            status: 400
        });
    }

    const user = await auth(req);

    if (user == null) {
        return NextResponse.json('unauthorized', {
            status: 401
        });
    }

    if ((user.permission & C.Permission.Template.edit) == 0) {
        return NextResponse.json('forbidden', {
            status: 403
        });
    }

    const tmp: Record<string, any> = {};

    tmp.rectHeight = data.height;
    tmp.rectWidth = data.width;
    tmp.offsetX = data.x;
    tmp.offsetY = data.y;

    await prisma.template.update({
        where: {
            name: name
        },
        data: tmp
    });

    return NextResponse.json({
        ...template,
        ...tmp
    }, {
        status: 200
    });
}
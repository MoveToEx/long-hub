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
    params: {
        name: string
    }
}) {
    const template = await prisma.template.findFirst({
        where: {
            name: params.name
        }
    });

    if (!template) {
        return NextResponse.json(params.name + ' not found', {
            status: 404
        });
    }

    return NextResponse.json(template);
}

export async function POST(req: NextRequest, {
    params
}: {
    params: {
        name: string
    }
}) {
    if (process.env.MEDIA_ROOT === undefined) {
        return NextResponse.json('MEDIA_ROOT env not found', {
            status: 500
        });
    }
    if (await prisma.template.count({
        where: {
            name: params.name
        }
    })) {
        return NextResponse.json(params.name + ' already exists', {
            status: 409
        });
    }

    const user = await auth(req, cookies());

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
    const img = fd.get('image') as File;

    if (!img) {
        return NextResponse.json('image not present in form data', {
            status: 400
        });
    }
    if (img.type == 'image/gif') {
        return NextResponse.json('gif not supported for templates', {
            status: 400
        });
    }

    const filename = params.name + '.' + _.last(img.name.split('.'));
    const template = await prisma.template.create({
        data: {
            name: params.name,
            image: filename,
            createdAt: new Date(),
            uploaderId: user.id
        },
    });

    var buffer = Buffer.from(await img.arrayBuffer());

    fs.writeFileSync(template.imagePath, buffer);

    return NextResponse.json({
        name: template.name
    }, {
        status: 201
    });
}

export async function PUT(req: NextRequest, {
    params
}: {
    params: {
        name: string
    }
}) {
    const template = await prisma.template.findFirst({
        where: {
            name: params.name
        }
    });
    const data = await req.json();

    if (!template) {
        return NextResponse.json(params.name + ' not found', {
            status: 404
        });
    }

    if ([data.height, data.width, data.x, data.y].some(x => x === undefined)) {
        return NextResponse.json('ill-formed request', {
            status: 400
        });
    }

    const user = await auth(req, cookies());

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
            name: params.name
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
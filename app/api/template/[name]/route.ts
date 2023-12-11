import { NextRequest, NextResponse } from "next/server";
import { Template } from '@/lib/db';
import sharp from 'sharp';
import Color from 'color';
import _ from 'lodash';
import fs from 'fs';
import path from 'node:path';

export async function GET(req: NextRequest, {
    params
}: {
    params: {
        name: string
    }
    }) {
    const template = await Template.findByPk(params.name);

    if (!template) {
        return NextResponse.json(params.name + ' not found', {
            status: 404
        });
    }

    return NextResponse.json(template.toJSON());
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
    if (await Template.findByPk(params.name)) {
        return NextResponse.json(params.name + ' already exists', {
            status: 409
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
    var template = Template.build({
        name: params.name,
        image: filename
    });

    var buffer = Buffer.from(await img.arrayBuffer());

    fs.writeFileSync(template.imagePath, buffer);

    template.save();

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
    const template = await Template.findByPk(params.name);
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

    template.rectHeight = data.height;
    template.rectWidth = data.width;
    template.offsetX = data.x;
    template.offsetY = data.y;

    await template.save();

    return NextResponse.json(template.toJSON(), {
        status: 200
    });
}
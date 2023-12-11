import { NextRequest, NextResponse } from "next/server";
import { Template } from '@/lib/db';
import sharp from 'sharp';
import _ from 'lodash';

export async function POST(req: NextRequest, {
    params
}: {
    params: {
        name: string
    }
}) {
    const data = await req.json();
    const template = await Template.findByPk(params.name);

    if (!template) {
        return NextResponse.json(params.name + ' not found', {
            status: 404
        });
    }

    console.log(data);

    const buf = await sharp(template.imagePath).composite([
        {
            input: {
                text: {
                    text: data.text ?? '',
                    width: data.rect?.width ?? template.rectWidth,
                    height: data.rect?.height ?? template.rectHeight,
                    align: data.align ?? 'center',
                    rgba: true,
                }
            },
            blend: "atop",
            left: data.rect?.x ?? template.offsetX,
            top: data.rect?.y ?? template.offsetY,
        }
    ]).png().toBuffer();

    return new Response(buf, {
        headers: {
            'Content-Type': 'image/png'
        }
    });
}

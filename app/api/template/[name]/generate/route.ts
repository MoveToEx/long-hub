import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';
import sharp from 'sharp';
import _ from 'lodash';

export async function POST(req: NextRequest, {
    params
}: {
    params: Promise<{ name: string }>
}) {
    const { name } = await params;
    const data = await req.json();
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

    if (!data.text) {
        const img = await sharp(template.imagePath).png().toBuffer();

        return new Response(img, {
            headers: {
                'Content-Type': 'image/png'
            }
        });
    }

    const textGenerator = await sharp({
        create: {
            width: data.rect?.width ?? template.rectWidth,
            height: data.rect?.height ?? template.rectHeight,
            channels: 4,
            background: 'rgba(0, 0, 0, 0)'
        }
    }).composite([
        {
            input: {
                text: {
                    text: data.text ?? '',
                    width: data.rect?.width ?? template.rectWidth,
                    height: data.rect?.height ?? template.rectHeight,
                    justify: true,
                    align: 'center',
                    font: '文泉驿微米黑',
                    rgba: true,
                }
            },
            left: 0,
            top: 0
        }
    ]).png().toBuffer();

    const text = await sharp(textGenerator).trim().png().toBuffer();

    const textWidth = (await sharp(text).metadata()).width;
    const offsetX = data.rect?.x ?? template.offsetX;
    const rectWidth = data.rect?.width ?? template.rectWidth;

    if (textWidth === undefined) {
        return new Response(null, {
            status: 500
        });
    }

    const buf = await sharp(template.imagePath).composite([
        {
            input: text,
            left: Math.floor(offsetX + (rectWidth - textWidth) / 2),
            top: data.rect?.y ?? template.offsetY,
        }
    ]).png().toBuffer();

    return new Response(buf, {
        headers: {
            'Content-Type': 'image/png'
        }
    });
}

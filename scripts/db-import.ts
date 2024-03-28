import fs from 'fs';
import { prisma } from '../lib/db';
import tar from 'tar';
import _ from 'lodash';
import cp from 'cli-progress';

// @ts-expect-error
import phash from "sharp-phash";
import path from 'node:path';

require('dotenv').config({
    path: '.env.local'
});

(async () => {
    if (process.env.MEDIA_ROOT == undefined) {
        throw new Error('MEDIA_ROOT not found');
    }
    const afn = process.argv[2];
    const postsFolder = path.join(process.env.MEDIA_ROOT, 'posts');
    const templateFolder = path.join(process.env.MEDIA_ROOT, 'templates');

    console.log('removing entries...');

    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    await prisma.template.deleteMany();
    await prisma.tag.deleteMany();
    
    if (fs.existsSync(postsFolder)) {
        fs.rmSync(postsFolder, { recursive: true });
    }

    if (fs.existsSync(templateFolder)) {
        fs.rmSync(templateFolder, { recursive: true });
    }
    
    fs.mkdirSync(postsFolder);
    fs.mkdirSync(templateFolder);

    console.log('extracting archive...');

    await tar.x({
        file: afn,
        cwd: process.env.MEDIA_ROOT
    });

    const users = JSON.parse(fs.readFileSync(path.join(process.env.MEDIA_ROOT, 'users.json')).toString());

    for (const user of users) {
        await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                permission: user.permission,
                accessKey: user.accessKey,
                passwordHash: user.passwordHash,
                createdAt: new Date(user.createdAt)
            }
        });
    }

    fs.rmSync(path.join(process.env.MEDIA_ROOT, 'users.json'));

    var posts = JSON.parse(fs.readFileSync(path.join(process.env.MEDIA_ROOT, 'posts.json')).toString());

    if (fs.existsSync(path.join(process.env.MEDIA_ROOT, 'templates.json'))) {
        var templates = JSON.parse(fs.readFileSync(path.join(process.env.MEDIA_ROOT, 'templates.json')).toString());

        for (var t of templates) {
            await prisma.template.create({
                data: {
                    name: t.name,
                    offsetX: t.offsetX,
                    offsetY: t.offsetY,
                    rectHeight: t.rectHeight,
                    rectWidth: t.rectWidth,
                    image: t.image,
                    style: t.style,
                    createdAt: new Date()
                }
            });
        }

        fs.rmSync(path.join(process.env.MEDIA_ROOT, 'templates.json'));
    }

    console.log('calculating hash & restoring tag relationship...');

    const pb = new cp.SingleBar({}, cp.Presets.shades_classic);
    pb.start(posts.length, 0);

    for (var p of posts) {

        const tags = [];

        for (const _tag of p.tags) {
            const tag = await prisma.tag.findFirst({
                where: {
                    name: _tag.name
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
                        name: _tag.name
                    }
                }));
            }
        }
        const post = await prisma.post.create({
            data: {
                id: p.id,
                text: p.text,
                image: _.last(p.image.split('/')),
                aggr: p.aggr,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                uploaderId: p.uploaderId,
                tags: {
                    connect: tags
                }
            }
        });

        const imgData = fs.readFileSync(post.imagePath);

        await prisma.post.update({
            where: {
                id: post.id
            },
            data: {
                imageHash: await phash(imgData)
            }
        });

        pb.increment();
    }

    pb.stop();

    fs.rmSync(path.join(process.env.MEDIA_ROOT, 'posts.json'));
})();
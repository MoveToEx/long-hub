import fs from 'fs';
import { Post, Tag, Template } from '@/lib/db';
import tar from 'tar';
import path from 'node:path';

require('dotenv').config({
    path: '.env.local'
});

(async () => {
    if (fs.existsSync('archive.tar')) {
        fs.rmSync('archive.tar');
    }

    const posts = await Post.findAll({
        attributes: {
            exclude: ['imagePath', 'imageURL', 'imageHash']
        },
        include: {
            model: Tag,
            through: {
                attributes: []
            }
        }
    });

    const templates = await Template.findAll({
        attributes: {
            exclude: ['imagePath', 'imageURL']
        }
    });

    fs.writeFileSync('./posts.json', JSON.stringify(posts.map(x => x.toJSON())));
    fs.writeFileSync('./templates.json', JSON.stringify(templates.map(x => x.toJSON())));

    await tar.create({
        file: 'archive.tar',
        cwd: process.env.MEDIA_ROOT
    }, ['posts', 'templates']);

    await tar.update({
        file: 'archive.tar',
    }, ['posts.json']);

    await tar.update({
        file: 'archive.tar',
    }, ['templates.json']);

    fs.rmSync('./posts.json');
    fs.rmSync('./templates.json');
})();
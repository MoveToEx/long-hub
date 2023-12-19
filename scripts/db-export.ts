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
        }
    });

    const templates = await Template.findAll({
        attributes: {
            exclude: ['imagePath', 'imageURL']
        }
    });

    const tags = await Tag.findAll();

    let _posts = [];
    for (const post of posts) {
        _posts.push({
            ...post.toJSON(),
            tags: (await post.getTags()).map(tag => tag.id)
        });
    }

    fs.writeFileSync('./posts.json', JSON.stringify(_posts));
    fs.writeFileSync('./templates.json', JSON.stringify(templates.map(x => x.toJSON())));
    fs.writeFileSync('./tags.json', JSON.stringify(tags.map(x => x.toJSON())));

    await tar.create({
        file: 'archive.tar',
        cwd: process.env.MEDIA_ROOT
    }, ['posts', 'templates']);

    await tar.update({
        file: 'archive.tar',
    }, ['posts.json', 'templates.json', 'tags.json']);

    fs.rmSync('./posts.json');
    fs.rmSync('./tags.json');
    fs.rmSync('./templates.json');
})();
import fs from 'fs';
import { Post, Tag } from '@/lib/db';
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
    const data = posts.map(x => x.toJSON());

    fs.writeFileSync('./posts.json', JSON.stringify(data));

    await tar.create({
        file: 'archive.tar',
        cwd: process.env.MEDIA_ROOT
    }, ['posts']);

    await tar.update({
        file: 'archive.tar',
    }, ['posts.json']);

    fs.rmSync('./posts.json');
})();
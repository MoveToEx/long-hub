import fs from 'fs';
import { Post, Tag, User, seq } from '../lib/db';
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

    console.log('removing entries...');
    
    if (fs.existsSync(postsFolder)) {
        fs.rmSync(postsFolder, { recursive: true });
    }
    
    fs.mkdirSync(postsFolder);
    
    await seq.sync({ force: true });

    console.log('extracting archive...');

    await tar.x({
        file: afn,
        cwd: process.env.MEDIA_ROOT
    });

    var posts = JSON.parse(fs.readFileSync(path.join(process.env.MEDIA_ROOT, 'posts.json')).toString());

    // var archiver = await User.create({
    //     name: '__archiver'
    // });

    console.log('calculating hash & restoring tag relationship...');

    const pb = new cp.SingleBar({}, cp.Presets.shades_classic);
    pb.start(posts.length, 0);
    var i = 0;


    for (var p of posts) {
        var post = await Post.create({
            id: p.id,
            text: p.text,
            image: _.last(p.image.split('/')),
            aggr: p.aggr,
        });

        const imgData = fs.readFileSync(post.imagePath);

        post.imageHash = await phash(imgData);

        // await archiver.addPost(post);

        var tags = [];

        for (var tagName of p.tags) {
            var [tag, created] = await Tag.findOrCreate({
                where: {
                    name: tagName.name
                },
                defaults: {
                    name: tagName.name
                }
            });

            tags.push(tag);
        }

        await post.setTags(tags);

        await post.save();

        pb.update(++i);
    }

    pb.stop();

    fs.rmSync(path.join(process.env.MEDIA_ROOT, 'posts.json'));
})();
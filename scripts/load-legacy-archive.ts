import fs from 'fs';
import { Post, Tag, User, seq } from '@/lib/db';
import tar from 'tar';

(async () => {
    const afn = process.argv[2];
    
    if (!afn.endsWith('.tar')) {
        return;
    }

    await seq.sync();

    fs.mkdirSync('./_tmp');

    await tar.x({
        file: afn,
        cwd: './_tmp'
    });

    var posts = JSON.parse(fs.readFileSync('./_tmp/long.json').toString());

    var archiver = await User.findByPk(1);

    for (var p of posts) {
        var post = await Post.create({
            id: p.id,
            text: p.text,
            image: p.image.replace('long', 'posts').replace('uploads', 'upload'),
            aggr: Math.ceil(p.aggressiveness * 20) / 2
        });

        await (archiver as any).addPost(post);

        var tags = [];

        for (var tag of p.tags) {
            var [_, created] = await Tag.findOrCreate({
                where: {
                    name: tag
                },
                defaults: {
                    name: tag
                }
            });

            tags.push(_);
        }

        await (post as any).setTags(tags);

        await post.save();
    }


    fs.rmSync('./_tmp', { recursive: true });
})();
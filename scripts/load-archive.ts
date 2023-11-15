import fs from 'fs';
import { Post, Tag, User, seq } from '@/lib/db';
import tar from 'tar';

(async () => {
    const afn = process.argv[2];
    
    if (!afn.endsWith('.tar')) {
        return;
    }

    if (fs.existsSync('./upload/posts')) {
        fs.rmSync('./upload/posts', { recursive: true });
    }

    fs.mkdirSync('./upload/posts');

    await seq.sync({ force: true });

    await tar.x({
        file: afn,
        cwd: './upload/'
    });

    var posts = JSON.parse(fs.readFileSync('./upload/posts.json').toString());

    var archiver = await User.create({
        name: '__archiver'
    });

    for (var p of posts) {
        var post = await Post.create({
            id: p.id,
            text: p.text,
            image: p.image,
            aggr: p.aggr,
        });

        await (archiver as any).addPost(post);

        var tags = [];

        for (var tag of p.tags) {
            var [_, created] = await Tag.findOrCreate({
                where: {
                    name: tag.name
                },
                defaults: {
                    name: tag.name
                }
            });

            tags.push(_);
        }

        await (post as any).setTags(tags);

        await post.save();
    }


    fs.rmSync('./upload/posts.json');
})();
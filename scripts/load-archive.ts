import fs from 'fs';
import { Post, Tag, User, seq } from '@/lib/db';
import tar from 'tar';
import cp from 'cli-progress';

// @ts-expect-error -- upstream types do not exist: https://github.com/btd/sharp-phash/issues/14
import phash from "sharp-phash";

(async () => {
    const afn = process.argv[2];
    
    if (!afn.endsWith('.tar')) {
        return;
    }

    if (fs.existsSync('./upload/posts')) {
        fs.rmSync('./upload/posts', { recursive: true });
    }

    console.log('removing entries...');

    fs.mkdirSync('./upload/posts');

    await seq.sync({ force: true });

    console.log('extracting archive...');

    await tar.x({
        file: afn,
        cwd: './upload/'
    });

    var posts = JSON.parse(fs.readFileSync('./upload/posts.json').toString());

    var archiver = await User.create({
        name: '__archiver'
    });

    console.log('calculating hash & restoring tag relationship...');

    const pb = new cp.SingleBar({}, cp.Presets.shades_classic);
    pb.start(posts.length, 0);
    var i = 0;

    for (var p of posts) {
        var post = await Post.create({
            id: p.id,
            text: p.text,
            image: p.image,
            aggr: p.aggr,
        });

        const imgData = fs.readFileSync('.' + p.image);

        (post as any).imageHash = await phash(imgData);

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

        pb.update(++i);
    }

    pb.stop();

    fs.rmSync('./upload/posts.json');
})();
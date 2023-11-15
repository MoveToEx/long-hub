import fs from 'fs';
import { Post, Tag, User, seq } from '@/lib/db';
import tar from 'tar';

(async () => {
    if (fs.existsSync('archive.tar')) {
        fs.unlinkSync('archive.tar');
    }

    const posts = await Post.findAll({
        include: {
            model: Tag,
            through: {
                attributes: []
            }
        }
    });
    const data = posts.map(x => x.toJSON());
    
    fs.writeFileSync('./upload/posts.json', JSON.stringify(data));

    await tar.create({
        file: 'archive.tar',
        cwd: './upload/'
    }, ['posts', 'posts.json']);

    fs.unlinkSync('./upload/posts.json')


})();
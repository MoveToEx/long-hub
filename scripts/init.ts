import { seq, User } from "@/lib/db";
import fs from 'fs';
import crypto from 'crypto';

(async () => {
    fs.mkdirSync('./upload/posts', { recursive: true });
    await seq.sync({ force: true });

    await User.create({
        name: '__archiver'
    });
})();
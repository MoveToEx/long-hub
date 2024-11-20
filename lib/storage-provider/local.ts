import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

export default class LocalProvider {
    MEDIA_ROOT: string;
    MEDIA_URL_PREFIX: string;

    constructor({
        MEDIA_ROOT,
        MEDIA_URL_PREFIX
    }: {
        MEDIA_ROOT: string,
        MEDIA_URL_PREFIX: string
    }) {
        this.MEDIA_ROOT = MEDIA_ROOT;
        this.MEDIA_URL_PREFIX = MEDIA_URL_PREFIX;
    }

    resolve(name: string) {
        if (this.MEDIA_ROOT === undefined) {
            throw new Error('MEDIA_ROOT not defined');
        }
        return path.join(this.MEDIA_ROOT, name);
    }

    async create(name: string, buffer: Buffer, options: {
        ContentType: string
    }) {
        const path = this.resolve(name);
        await fs.promises.writeFile(path, Readable.from(buffer));
        return this.MEDIA_URL_PREFIX + name
    }

    async remove(name: string) {
        await fs.promises.rm(this.resolve(name));
    }
}
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export default class R2Provider {
    client: S3Client;
    BUCKET_NAME: string;
    PREFIX: string;
    
    constructor(env: {
        R2_ACCOUNT_ID: string
        R2_ACCESS_KEY_ID: string
        R2_SECRET_ACCESS_KEY: string
        R2_BUCKET_NAME: string
        R2_PREFIX: string
    }) {
        this.client = new S3Client({
            endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            region: 'auto',
            credentials: {
                accessKeyId: env.R2_ACCESS_KEY_ID,
                secretAccessKey: env.R2_SECRET_ACCESS_KEY,
            }
        });
        this.BUCKET_NAME = env.R2_BUCKET_NAME;
        this.PREFIX = env.R2_PREFIX;
    }

    async create(key: string, buffer: Buffer, options: {
        ContentType: string
    }) {
        await this.client.send(new PutObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: key,
            ContentType: options.ContentType,
            Body: buffer
        }));

        return this.PREFIX + key;
    }

    async remove(key: string) {
        await this.client.send(new DeleteObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: key
        }));
    }
}
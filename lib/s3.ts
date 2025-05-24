import 'server-only';
import { S3Client, PutObjectCommand, DeleteObjectCommand, NotFound, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from './env';

const client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: 'auto',
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    }
});
const BUCKET_NAME = env.S3_BUCKET_NAME;

const s3 = {
    async presign(key: string, ContentType: string) {
        const cmd = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType
        });
        return await getSignedUrl(client, cmd, {
            expiresIn: 300,
        });
    },
    async remove(key: string) {
        await client.send(new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        }));
    },
    async exists(key: string) {
        try {
            const cmd = new HeadObjectCommand({
                Bucket: env.S3_BUCKET_NAME,
                Key: key,
            });
            await client.send(cmd);
            return true;
        } catch (error) {
            if (error instanceof NotFound) {
                return false;
            } else {
                throw error;
            }
        }
    }
};

export default s3;
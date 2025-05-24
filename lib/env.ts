import { z } from 'zod';
import 'server-only';

const schema = z.object({
    COOKIE_NAME: z.string(),
    COOKIE_SECRET: z.string(),

    CF_TURNSTILE_KEY: z.string(),
    CF_TURNSTILE_SECRET: z.string(),
    DATABASE_URL: z.string(),
    SILICONFLOW_API_KEY: z.string(),

    S3_ENDPOINT: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    S3_BUCKET_NAME: z.string(),
    S3_PREFIX: z.string()
});

const env = schema.parse(process.env);

export default env;
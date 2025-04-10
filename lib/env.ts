import { z } from 'zod';
import 'server-only';

const s = z.object({
    COOKIE_NAME: z.string(),
    COOKIE_SECRET: z.string(),

    CF_TURNSTILE_KEY: z.string(),
    CF_TURNSTILE_SECRET: z.string(),
    DATABASE_URL: z.string(),
    SILICONFLOW_API_KEY: z.string(),
});

const schema = z.union([
    s.merge(z.object({
        STORAGE_PROVIDER: z.literal('local'),
        MEDIA_ROOT: z.string(),
        MEDIA_URL_PREFIX: z.string(),
    })),
    s.merge(z.object({
        STORAGE_PROVIDER: z.literal('r2'),
        R2_ACCOUNT_ID: z.string(),
        R2_ACCESS_KEY_ID: z.string(),
        R2_SECRET_ACCESS_KEY: z.string(),
        R2_BUCKET_NAME: z.string(),
        R2_PREFIX: z.string()
    }))
]);

const data = schema.parse(process.env);

export default data;
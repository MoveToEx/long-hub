import { z } from 'zod';
import 'server-only';

const schema = z.object({
    COOKIE_NAME: z.string(),
    COOKIE_SECRET: z.string(),
    MEDIA_ROOT: z.string(),
    MEDIA_URL_PREFIX: z.string(),
    CF_TURNSTILE_KEY: z.string(),
    CF_TURNSTILE_SECRET: z.string(),
    DATABASE_URL: z.string()
});

const data = schema.parse(process.env);

export default data;
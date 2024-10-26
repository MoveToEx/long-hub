import { z } from 'zod';

const schema = z.object({
    COOKIE_NAME: z.string(),
    COOKIE_SECRET: z.string(),
    MEDIA_ROOT: z.string(),
    MEDIA_URL_PREFIX: z.string(),
    CF_TURNSTILE_KEY: z.string(),
    CF_TURNSTILE_SECRET: z.string(),
    DATABASE_URL: z.number()
});

const { data, success, error } = schema.safeParse(process.env);

if (!success) {
    console.error('Invalid environment variable', error.format());
    process.exit(1);
}

export default data;
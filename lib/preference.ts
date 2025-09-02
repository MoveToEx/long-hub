import z from "zod";

export const schema = z.object({
    allowNSFW: z.boolean().optional().default(false)
});

export type Preference = z.infer<typeof schema>;

declare global {
    namespace PrismaJson {
        type Preference = Partial<z.infer<typeof schema>>;
    }
}
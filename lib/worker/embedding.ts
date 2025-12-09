import { PgBoss, Job } from 'pg-boss';
import { prisma } from '@/lib/db';
import { embeddingProvider } from '@/lib/embedding';

export type JobParams = {
    id: string;
};

export default async function embeddingRunner(
    boss: PgBoss,
    { data: params }: Job<JobParams>,
) {
    const post = await prisma.post.findFirst({
        where: {
            id: params.id
        }
    });

    if (post === null) return;
    if (post.text === '') return;

    const v = await embeddingProvider.get_text_embedding([post.text]);

    const s = `[${v[0].join(',')}]`;
    await prisma.$queryRaw`
        UPDATE post SET "text_embedding" = ${s}::vector WHERE "id" = ${post.id}`;
}

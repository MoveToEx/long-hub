import { PgBoss, Job } from 'pg-boss';
import { prisma } from '@/lib/db';
import phash from 'sharp-phash';

export type JobParams = {
    id: string;
};

export default async function hashRunner(
    boss: PgBoss,
    { data: params }: Job<JobParams>,
) {
    const post = await prisma.post.findFirst({
        where: {
            id: params.id
        }
    });

    if (post === null) return;
    if (post.imageHash !== null) return;

    const response = await fetch(post.imageURL);
    const hash = await phash(await response.arrayBuffer());

    await prisma.post.update({
        where: {
            id: params.id
        },
        data: {
           imageHash: hash
        }
    });
}

import PgBoss, { Job } from 'pg-boss';
import { prisma } from '@/lib/db';
import s3 from '@/lib/s3';
import { UploadSessionStatus } from '@prisma/client';

export type JobParams = {
    id: string;
};

export default async function recycleRunner(
    boss: PgBoss,
    { data: params }: Job<JobParams>,
) {
    const session = await prisma.upload_session.findFirst({
        where: {
            id: params.id,
        },
    });
    
    if (session === null) {
        return;
    }

    if (session.status !== UploadSessionStatus.active) {
        return;
    }

    await prisma.upload_session.update({
        where: {
            id: params.id
        },
        data: {
            status: UploadSessionStatus.expired
        }
    });

    const f = await s3.exists(session.key);

    if (!f) {
        return;
    }

    await s3.remove(session.key);
}

import PgBoss from 'pg-boss';
import embeddingRunner, { type JobParams as EmbeddingParams } from './embedding';
import recycleRunner, { type JobParams as RecycleParams } from './recycle';
import hashRunner, { type JobParams as HashParams } from './image-hash';

export enum Jobs {
    recycle = 'recycle',
    embedding = 'embedding',
    hash = 'hash'
}

const singleton = async () => {
    const boss = new PgBoss(process.env.DATABASE_URL as string);
    boss.on('error', console.error);
    await boss.start();

    for (const key in Jobs) {
        await boss.createQueue(key);
    }
    await boss.work<EmbeddingParams>(Jobs.embedding, async ([job]) => {
        return embeddingRunner(boss, job);
    });
    await boss.work<RecycleParams>(Jobs.recycle, async ([job]) => {
        return recycleRunner(boss, job);
    });
    await boss.work<HashParams>(Jobs.hash, async ([job]) => {
        return hashRunner(boss, job);
    });
    return boss;
};

declare const globalThis: {
    boss: Awaited<ReturnType<typeof singleton>>;
} & typeof global;

const boss = globalThis.boss ?? (await singleton());

if (process.env.NODE_ENV !== 'production') globalThis.boss = boss;

const worker = {
    async recycle(id: string, delay: number) {
        await boss.sendAfter(
            Jobs.recycle,
            { id },
            {
                retryLimit: 5,
                retryDelay: 300,
            },
            delay,
        );
    },

    async embedding(id: string) {
        await boss.send(Jobs.embedding, { id });
    },

    async hash(id: string) {
        await boss.send(Jobs.hash, { id }, {
            retryLimit: 5,
            retryDelay: 10
        });
    }
};

export default worker;
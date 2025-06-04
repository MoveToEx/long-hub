import { prisma } from '@/lib/db';
import _ from 'lodash';

export type Configuration = {
    allowRegistration: boolean;
    maxUploadRate: number;
    defaultPermission: number;
    uploadSessionExpiration: number;
};

const defaults: Configuration = {
    allowRegistration: true,
    maxUploadRate: 10,
    defaultPermission: 0x2,
    uploadSessionExpiration: 300
};

export async function get<K extends keyof Configuration>(key: K): Promise<Configuration[K]> {
    const item = await prisma.configuration.findFirst({
        where: {
            key
        }
    });
    if (item === null) return defaults[key];

    return JSON.parse(item.value) as Configuration[K];
}

export async function getAll(): Promise<Configuration> {
    let result: Configuration = _.cloneDeep(defaults);

    const items = await prisma.configuration.findMany();

    const set = <K extends keyof Configuration>(key: K, value: Configuration[K]) => {
        result[key] = value;
    }

    for (const item of items) {
        const key = item.key as keyof Configuration;
        set(key, JSON.parse(item.value));
    }

    return result;
}

export async function set<K extends keyof Configuration>(key: K, value: Configuration[K]) {
    await prisma.configuration.upsert({
        where: {
            key
        },
        create: {
            key,
            value: JSON.stringify(value)
        },
        update: {
            value: JSON.stringify(value)
        }
    });
}
import { PrismaClient } from '@prisma/client';

const singleton = () => new PrismaClient();

declare const globalThis: {
    prismaGlobal: ReturnType<typeof singleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? singleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
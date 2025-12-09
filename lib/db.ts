import 'server-only'

import { PrismaClient } from '@/prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';


const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
})

const singleton = () => new PrismaClient({
    adapter
});

declare const globalThis: {
    prismaGlobal: ReturnType<typeof singleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? singleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

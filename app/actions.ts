'use server';

import { auth } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getPostsCount() {
    const result: {
        date: Date,
        total: bigint
    }[] = await prisma.$queryRaw(Prisma.sql`
        SELECT DATE(createdAt) AS date, COUNT(*) AS total
        FROM post
        WHERE createdAt > DATE_SUB(NOW(), INTERVAL 28 DAY)
        GROUP BY date
        ORDER BY date ASC`);
    
    return result;
}

export async function getRandomPost() {
    const data: {
        id: string,
        text: string,
        imageURL: string
    }[] = await prisma.$queryRaw(Prisma.sql`
        SELECT id, text, imageURL FROM post
        ORDER BY RAND()
        LIMIT 4`);
    return data;
}

export async function getContribution() {
    const user = await auth();

    if (!user) {
        return null;
    }

    const data: {
        total: bigint,
        date: Date
    }[] = await prisma.$queryRaw(Prisma.sql`
        SELECT COUNT(*) AS total, DATE(createdAt) AS date
        FROM post
        WHERE uploaderId = ${user.id}
        GROUP BY date
        ORDER BY date ASC`);

    return data;
}
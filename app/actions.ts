'use server';

import { auth } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getPostsCount() {
    const result: {
        date: Date,
        count: bigint
    }[] = await prisma.$queryRaw(Prisma.sql`
        SELECT DATE(createdAt) AS date, COUNT(*) AS 'count'
        FROM post
        WHERE createdAt > DATE_SUB(NOW(), INTERVAL 28 DAY) AND post.deletedAt IS NULL
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
        WHERE post.deletedAt IS NULL
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
        count: bigint,
        date: Date
    }[] = await prisma.$queryRaw(Prisma.sql`
        SELECT COUNT(*) AS 'count', DATE(createdAt) AS date
        FROM post
        WHERE uploaderId = ${user.id} AND createdAt > DATE_SUB(NOW(), INTERVAL 364 DAY) AND post.deletedAt IS NULL
        GROUP BY date
        ORDER BY date ASC`);

    return data;
}
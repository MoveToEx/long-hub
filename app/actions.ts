'use server';

import { auth } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/session";
import { Post } from "@/lib/types";

export default async function logout() {
    const session = await getSession();
    session.destroy();
}

export async function getPostsCount() {
    const result: {
        date: Date,
        count: bigint
    }[] = await prisma.$queryRaw(Prisma.sql`
        SELECT "createdAt"::DATE AS "date", COUNT(*) AS "count"
        FROM post
        WHERE "createdAt" > NOW() - INTERVAL '28 days' AND "deletedAt" IS NULL
        GROUP BY date
        ORDER BY date ASC`);
    
    return result;
}

export async function getRandomPost() {
    const data: Post[] = await prisma.$queryRaw(Prisma.sql`
        SELECT "id", "text", "imageURL" FROM post
        WHERE "deletedAt" IS NULL
        ORDER BY RANDOM()
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
        SELECT COUNT(*) AS "count", "createdAt"::DATE AS "date"
        FROM post
        WHERE "uploaderId" = ${user.id} AND "createdAt" > NOW() - INTERVAL '364 days' AND "deletedAt" IS NULL
        GROUP BY "date"
        ORDER BY "date" ASC`);

    return data;
}
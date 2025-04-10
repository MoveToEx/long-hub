'use server';

import { prisma } from "@/lib/db";
import { embeddingProvider } from "@/lib/embedding";
import { post } from "@prisma/client";


export async function vSearch(text: string) {
    if (text === '') return [];

    const embedding = (await embeddingProvider.get_text_embedding([text]))[0];
    const q = `[${embedding.join(',')}]`;
    const result: (Pick<post, 'id' | 'imageURL' | 'text'> & {
        difference: number
    })[] = await prisma.$queryRaw`
        SELECT "id", "text", "imageURL", ("text_embedding" <=> ${q}::vector) AS "difference"
        FROM post
        WHERE "text_embedding" IS NOT NULL
        ORDER BY "difference"
        LIMIT 8`;
    
    return result;
}
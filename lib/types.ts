import { prisma } from '@/lib/db';
import { Prisma } from "@/lib/schema";
import { Preference } from "./preference";

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Tag = {
    id: number;
    name: string;
}

export type Post = PartialBy<
    Pick<NonNullable<Prisma.Result<typeof prisma.post, {
        include: {
            tags: true
        }
    }, 'findFirst'>>,
        'id' | 'imageURL' | 'text' | 'tags'>, 'tags'>;

export type Self = (
    Omit<NonNullable<Prisma.Result<typeof prisma.user, {}, 'findFirst'>>, 'preference'> & {
        preference: Preference
    }
)

export type User = NonNullable<Prisma.Result<typeof prisma.user, {
    select: {
        id: true,
        name: true,
        post: true,
        createdAt: true
    }
}, 'findFirst'>>;
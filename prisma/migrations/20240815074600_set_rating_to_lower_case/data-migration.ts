import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.$transaction(async (tx) => {
        await tx.post.updateMany({
            where: {
                aggr: 0
            },
            data: {
                rating: 'none'
            }
        });
        await tx.post.updateMany({
            where: {
                aggr: {
                    gt: 0,
                    lte: 5
                }
            },
            data: {
                rating: 'moderate'
            }
        });
        await tx.post.updateMany({
            where: {
                aggr: {
                    gt: 5,
                    lte: 10
                }
            },
            data: {
                rating: 'violent'
            }
        });
    });
}

main()
    .catch(async (e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => await prisma.$disconnect());
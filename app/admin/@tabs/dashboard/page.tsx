import { prisma } from "@/lib/db";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import icon from '@/public/o.png';
import Image from "next/image";
import { NewPostChart, ContributionChart } from "./components";
import _ from "lodash";
import { Prisma } from "@prisma/client";


export default async function DashboardTab() {
    const contribution: {
        name: string,
        count: bigint
    }[] = await prisma.$queryRaw`
        SELECT "user"."name" AS "name", COUNT(*) AS "count" FROM "post"
        INNER JOIN "user" ON "post"."uploaderId" = "user"."id"
        WHERE "post"."createdAt" >= NOW() - INTERVAL '28 days' AND "deletedAt" is NULL
        GROUP BY "user"."id"`;

    const series: {
        date: Date,
        count: bigint
    }[] = await prisma.$queryRaw`
        SELECT "createdAt"::DATE AS "date", COUNT(*) AS "count"
        FROM post
        WHERE "createdAt" > NOW() - INTERVAL '28 days' AND "deletedAt" IS NULL
        GROUP BY date
        ORDER BY date ASC`;

    const vec: { indexed: BigInt, total: BigInt }[] = await prisma.$queryRaw`
            SELECT COUNT(*) as total,
            COUNT(*) FILTER (WHERE "text_embedding" IS NOT NULL) AS indexed
            FROM post
            WHERE "text" <> '' AND "deletedAt" IS NULL`;

    const count = await prisma.post.count({
        where: {
            deletedAt: null
        }
    });

    return (
        <Box>
            <Box>
                <Typography className='flex flex-row items-baseline justify-center font-thin' sx={{
                    fontSize: 64
                }}>
                    L<Image
                        style={{
                            display: 'inline-block'
                        }}
                        src={icon}
                        alt='O'
                        height={52} />NG
                </Typography>
            </Box>
            <Typography>
                {count} posts in total, {vec[0].indexed.toString()} / {vec[0].total.toString()} indexed by vector db
            </Typography>

            <Grid container>
                <Grid size={{ md: 6, xs: 12 }}>
                    <ContributionChart
                        data={contribution.map(item => ({
                            label: item.name,
                            value: Number(item.count),
                        }))} />
                </Grid>

                <Grid size={{ md: 6, xs: 12 }}>
                    <NewPostChart data={series.map(item => ({
                        count: Number(item.count),
                        date: item.date
                    }))} />
                </Grid>
            </Grid>

        </Box>
    )
}
import { auth } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { schema } from "@/lib/preference";
import { prisma } from '@/lib/db';
import _ from "lodash";

const patchSchema = z.object({
    preference: schema.optional()
});

export async function PATCH(req: NextRequest) {
    const user = await auth();

    if (!user) {
        return NextResponse.json({
            error: 'User not logged in'
        }, {
            status: 401
        });
    }

    const { data, error } = patchSchema.safeParse(await req.json());

    if (error) {
        return NextResponse.json({
            message: 'Invalid request',
            error: z.treeifyError(error)
        }, {
            status: 400
        });
    }

    if (data.preference && !_.isEqual(data.preference, user.preference)) {
        const result = _.merge(user.preference, data.preference);

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                preference: result
            }
        });
    }

    return NextResponse.json(user.preference);
}
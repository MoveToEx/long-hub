import { NextResponse, NextRequest } from "next/server";
import { Post, Tag } from "@/lib/db";
import { Op } from "sequelize";
import _ from "lodash";

export async function GET(req: NextRequest, {
    params
}: {
    params: {
        query: string
    }
}) {
    const { searchParams } = new URL(req.url);
    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '24');
    const query = JSON.parse(Buffer.from(params.query, 'base64').toString());

    var filterOption: any = {
        where: {},
        include: {
            model: Tag,
            as: 'tags',
            through: {
                attributes: []
            }
        }
    };

    if (!_.isEmpty(query.text)) {
        filterOption.where.text = {
            [Op.and]: query.text.map((s: string) => ({
                [Op.like]: '%' + s + '%'
            }))
        }
    }

    if (!_.isEmpty(query.aggr)) {
        filterOption.where.aggr = {
            ...(query.aggr.gt != undefined && {
                [Op.gt]: query.aggr.gt,
            }),
            ...(query.aggr.gte != undefined && {
                [Op.gte]: query.aggr.gte,
            }),
            ...(query.aggr.lt != undefined && {
                [Op.lt]: query.aggr.lt,
            }),
            ...(query.aggr.lte != undefined && {
                [Op.lte]: query.aggr.lte,
            }),
            ...(query.aggr.eq != undefined && {
                [Op.eq]: query.aggr.eq,
            }),
            ...(query.aggr.ne != undefined && {
                [Op.ne]: query.aggr.ne,
            }),
        };
    }

    if (!_.isEmpty(query.id)) {
        filterOption.where.id = {
            [Op.and]: query.id.map((s: string) => ({
                [Op.like]: s.replace('*', '%')
            }))
        };
    }

    if (!_.isEmpty(query.tag)) {
        if (!_.isEmpty(query.tag.include) && !_.isEmpty(query.tag.exclude)) {
            filterOption.include.where = {
                name: {
                    ...(!_.isEmpty(query.tag.include) && {
                        [Op.in]: query.tag.include,
                    }),
                    ...(!_.isEmpty(query.tag.exclude) && {
                        [Op.notIn]: query.tag.exclude
                    })
                }
            };
        }
    }

    var posts = await Post.findAll(filterOption);

    if (!_.isEmpty(query.tag?.include)) {
        posts = posts.filter(
            (post: any) => query.tag.include.map(
                (s: string) => post.tags.map((tag: any) => tag.name).includes(s)
            ).reduce(
                (x: Boolean, y: Boolean) => x && y
            )
        );
    }

    return NextResponse.json({
        count: posts.length,
        data: posts.slice(offset, offset + limit)
    });
}
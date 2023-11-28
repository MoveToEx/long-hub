import { NextRequest, NextResponse } from "next/server";
import { Post, Tag } from "@/lib/db";
import _ from 'lodash';
import { Op } from 'sequelize';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    if (!searchParams.has('s')) {
        return NextResponse.json('query s not found', {
            status: 204
        });
    }

    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '24');
    const query = JSON.parse(Buffer.from(decodeURIComponent(searchParams.get('s') ?? ''), 'base64').toString());

    let textFilter, aggrFilter, tagFilter, idFilter;

    if (query.text !== undefined && !_.isEmpty(query.text)) {
        textFilter = {
            [Op.and]: query.text.map((s: string) => ({
                [Op.like]: '%' + s + '%'
            }))
        }
    }

    if (query.aggr !== undefined && !_.isEmpty(query.aggr)) {
        aggrFilter = {
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

    if (query.id !== undefined && !_.isEmpty(query.id)) {
        idFilter = {
            [Op.and]: query.id.map((s: string) => ({
                [Op.like]: s.replace('*', '%')
            }))
        };
    }

    if (query.tag !== undefined && !_.isEmpty(query.tag)) {
        if (!_.isEmpty(query.tag.include)) {
            tagFilter = {
                [Op.in]: query.tag.include
            }
        }
        if (!_.isEmpty(query.tag.exclude)) {
            tagFilter = {
                ...(tagFilter ?? {}),
                ...(!_.isEmpty(query.tag.exclude) && {
                    [Op.notIn]: query.tag.exclude
                })
            };
        }
    }

    var posts = await Post.findAll({
        where: {
            ...(textFilter ? { text: textFilter } : {}),
            ...(aggrFilter ? { aggr: aggrFilter } : {}),
            ...(idFilter ? { id: idFilter } : {}),
        },
        include: {
            model: Tag,
            as: 'tags',
            through: {
                attributes: []
            },
            ...(tagFilter ? { where: { name: tagFilter } } : {})
        }
    });

    if (query.tag !== undefined && !_.isEmpty(query.tag.include)) {
        for (var tagName of query.tag.include) {
            posts = posts.filter(post => post.tags.find(val => val.name == tagName) != undefined);
        }
    }

    return NextResponse.json({
        count: posts.length,
        data: posts.slice(offset, offset + limit)
    });
}
import { NextRequest, NextResponse } from "next/server";
import { Post, Tag } from "@/lib/db";
import _ from 'lodash';
import { Op } from 'sequelize';

const operators = {
    'gt': Op.gt,
    'lt': Op.lt,
    'lte': Op.lte,
    'gte': Op.gte,
    'eq': Op.eq,
    'ne': Op.ne,
};

function parseOperator(s: keyof typeof operators) {
    return operators[s];
}

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '24');
    let query;
    try {
        query = await req.json();
    }
    catch (e) {
        return NextResponse.json('failed when parsing JSON', {
            status: 400
        });
    }

    if (query.length > 24 || query.length < 1) {
        return NextResponse.json('illegal length of selectors', {
            status: 400
        });
    }

    let where: any = {};

    if (typeof query !== 'object' || !Array.isArray(query)) {
        return NextResponse.json('ill-formed request body', {
            status: 400
        });
    }

    if (query.some(item => item.type == 'text')) {
        where.text = {
            [Op.and]: query.filter(x => x.type == 'text').map(x => ({
                [Op.like]: '%' + x.value + '%'
            }))
        }
    }

    if (query.some(item => item.type == 'aggr')) {
        where.aggr = query.filter(x => x.type == 'aggr').reduce((a, x) => ({
            ...a,
            [parseOperator(x.op)]: x.value
        }), {});
    }

    if (query.some(item => item.type == 'id')) {
        where.id = {
            [Op.and]: query.filter(x => x.type == 'id').map(x => ({
                [Op.like]: x.value.replaceAll('*', '%')
            }))
        }
    }

    var posts = await Post.findAll({
        where: where,
        include: {
            model: Tag,
            as: 'tags',
            through: {
                attributes: []
            }
        }
    });

    if (query.some(x => x.type == 'tag' && x.op == 'include')) {
        query.filter(x => x.type == 'tag' && x.op == 'include').forEach(x => {
            posts = posts.filter(
                post => post.tags.find(tag => tag.name == x.value) != undefined
            );
        });
    }


    if (query.some(x => x.type == 'tag' && x.op == 'exclude')) {
        query.filter(x => x.type == 'tag' && x.op == 'exclude').forEach(x => {
            posts = posts.filter(
                post => post.tags.find(tag => tag.name == x.value) == undefined
            )
        })
    }

    return NextResponse.json({
        count: posts.length,
        data: posts.slice(offset, offset + limit)
    });
}
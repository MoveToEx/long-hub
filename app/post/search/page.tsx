import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinkImageGrid from '@/components/LinkImageGrid';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import { Tag, Post } from '@/lib/db';
import { SearchInput } from './components';
import { Op } from 'sequelize';
import Box from '@mui/material/Box';
import Pagination from '@/components/Pagination';
import * as C from '@/lib/constants';

export default async function SearchPage({
    searchParams
}: {
    searchParams?: {
        s?: string,
        page?: string
    }
}) {
    const page = Number(searchParams?.page ?? 1);
    const tags = await Tag.findAll({
        attributes: ['name']
    }).then(t => t.map(x => x.name));
    var s: string[] = [], posts: Post[] = [], count = 0;

    if (searchParams?.s) {
        s = JSON.parse(Base64.decode(searchParams.s));
    }
    else {
        s = [];
    }

    if (!_.isEmpty(s)) {
        let where: any = {
            [Op.and]: s.map(x => {
                if (x.startsWith('+') || x.startsWith('-')) {
                    return {};
                }
                else if (x.startsWith('@')) {
                    return { id: { [Op.like]: _.trimStart(x, '@').replaceAll('*', '%') } };
                }
                else if (x.startsWith('<') || x.startsWith('>') || x.startsWith('=') || x.startsWith('!=')) {
                    if (x.startsWith('<=')) {
                        return { aggr: { [Op.lte]: Number(_.trimStart(x, '<=')) } };
                    } else if (x.startsWith('>=')) {
                        return { aggr: { [Op.gte]: Number(_.trimStart(x, '>=')) } };
                    } else if (x.startsWith('<')) {
                        return { aggr: { [Op.lt]: Number(_.trimStart(x, '<')) } };
                    } else if (x.startsWith('>')) {
                        return { aggr: { [Op.gt]: Number(_.trimStart(x, '>')) } };
                    } else if (x.startsWith('=')) {
                        return { aggr: { [Op.eq]: Number(_.trimStart(x, '=')) } };
                    } else if (x.startsWith('!=')) {
                        return { aggr: { [Op.ne]: Number(_.trimStart(x, '!=')) } };
                    }
                }
                else {
                    return { text: { [Op.like]: '%' + x + '%' } };
                }
            })
        };
        
        console.log(where);
        posts = await Post.findAll({
            where: where,
            include: {
                model: Tag,
                as: 'tags',
                through: {
                    attributes: []
                }
            }
        });

        s.filter(x => x.startsWith('+') || x.startsWith('-')).forEach(x => {
            const tag = _.trimStart(x, '+-');
            if (x.startsWith('+')) {
                posts = posts.filter(
                    p => p.tags.find(t => t.name == tag) != undefined
                );
            }
            else {
                posts = posts.filter(
                    post => post.tags.find(t => t.name == tag) == undefined
                )
            }
        });

        count = posts.length;
        posts = posts.slice((page - 1) * C.PAGINATION_LIMIT, page * C.PAGINATION_LIMIT);
    }

    return (
        <Box sx={{mt: 2, mb: 2}}>
            <SearchInput value={s} tags={tags} />
            {
                !_.isEmpty(s) &&
                <Typography variant="h6" align="center">
                    Found {count} result{count > 1 ? 's' : ''}
                </Typography>
            }
            {
                !_.isEmpty(posts) && <LinkImageGrid
                src={posts.map(x => ({
                    href: `/post/${x.id}`,
                    src: x.imageURL!
                }))}
                gridContainerProps={{
                    spacing: 2
                }}
                gridProps={{
                    xs: 12,
                    sm: 6,
                    md: 3
                }} />
            }

            <Pagination total={C.pages(count)} />
        </Box>
    );
}
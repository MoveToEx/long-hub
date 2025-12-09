import { Rating } from '@/lib/schema';
import _ from 'lodash';

export const pageLimit = 24;
export const saltRound = 10;

export const pages = (total: number) => Math.ceil(total / pageLimit);

export const PermissionDescription = {
    1: 'Create new post',
    2: 'Edit post',
    8: 'Enter admin panel',
    9: 'Edit user',
    10: 'Delete user',
    11: 'Assign new permission to a user',
    12: 'Edit post',
    13: 'Delete post',
};

const ratings = Object.values(Rating);
export const RatingsMapping = _.range(ratings.length).map(x => ratings[x]);
export const ReverseRatingsMapping = _.zipObject(ratings, _.range(1, ratings.length + 1));

export const Permission = {
    super_user: 0x1,
    Post: {
        new: 0x2,
        edit: 0x4,
    },
    Template: {
        new: 0x8,
        edit: 0x10,
    },
    Admin: {
        base: 0x100,
        User: {
            edit: 0x200,
            delete: 0x400,
            assign: 0x800,
        },
        Post: {
            edit: 0x1000,
            delete: 0x2000
        },
        Template: {
            edit: 0x4000,
            delete: 0x8000,
        }
    }
}
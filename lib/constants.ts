
export const pageLimit = 24;
export const saltRound = 10;

export const pages = (total: number) => Math.ceil(total / pageLimit);

export const PermissionDescription = {
    1: 'Create new post',
    2: 'Edit post',
    3: 'Delete post',
    8: 'Enter admin panel',
    9: 'Edit user',
    10: 'Delete user',
    11: 'Assign new permission to a user',
    12: 'Transfer a post to a user'
};

export const Permission = {
    Post: {         // Permissions related to posts
        new: 0x2,
        edit: 0x4,
        delete: 0x8,
    },
    Admin: {
        base: 0x100,
        User: {         // Permission related to modifying user info
            edit: 0x200,
            delete: 0x400,
            assign: 0x800,
        },
        Post: {
            transfer: 0x1000,
        },
    }
}
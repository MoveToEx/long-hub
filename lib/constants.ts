
export const pageLimit = 24;
export const saltRound = 10;

export const pages = (total: number) => Math.ceil(total / pageLimit);

export const Permission = {
    write: 0x2,
    delete: 0x4,
}
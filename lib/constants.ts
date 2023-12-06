
export const PAGINATION_LIMIT = 24;

export const pages = (total: number) => Math.ceil(total / PAGINATION_LIMIT);
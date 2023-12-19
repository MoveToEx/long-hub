
export const pageLimit = 24;

export const pages = (total: number) => Math.ceil(total / pageLimit);

export const tagTypes = [
    'Unset',
    'Metadata',
    'Visual element',
    'Emotion',
    'Literal',
    'Parody',
    'Deprecated',
]
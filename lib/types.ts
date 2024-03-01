

export interface Tag {
    id: number;
    name: string;
}

export interface Post {
    id: string;
    text: string;
    image: string;
    imageURL: string;
    imageHash: string;
    aggr: number;
    tags: Tag[];
    uploaderId: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface PostResponse {
    count: number;
    data: Post[];
}
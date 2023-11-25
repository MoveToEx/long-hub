export interface PostDetailResponse {
    text: string,
    image?: string,
    createdAt: string,
    imageURL: string,
    tags: string[],
    aggr: number
}
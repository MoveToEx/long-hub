import TagResponse from "./TagResponse"

export default interface PostResponse {
    id: string,
    text: string,
    image?: string,
    createdAt: string,
    imageURL: string,
    tags: TagResponse[],
    aggr: number
}

export interface PostsResponse {
    count: number,
    data: PostResponse[]
}
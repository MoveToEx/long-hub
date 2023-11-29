
export default interface TagResponse {
    id: number,
    name: string,
    count: number
}

export type TagsResponse = TagResponse[];